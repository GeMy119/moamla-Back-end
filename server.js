process.on('uncaughtException', (err) => {
  console.log('closing the server due to uncaughtException💥!!');
  console.log('uncaughtException', err.name, err.message);
  process.exit(1);
});

import express from 'express';
import { DbConnection } from './databases/dbConnection/db.connection.js';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { limiter } from './src/middleware/rateLimit.js';
import init from './src/server.routes.js';

const app = express();
mongoose.set('strictQuery', true);

// 1. تعديل Helmet لكي يسمح للمتصفح بعرض الصور عبر الدومينات المختلفة (Cross-Origin)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. تفعيل الـ CORS بشكل كامل وصحيح لكل الدومينات
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. ميدل وير إضافي كضمان لحقن الـ CORS Headers في جميع الطلبات (بما فيها الصور والـ Routers)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// 4. تحديد معدل الطلبات للـ API
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(ExpressMongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '200kb' }));

// تفعيل المجلد الستاتيك للصور
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

// Cookie parser, reading cookies into req.cookies
app.use(cookieParser());

if (process.env.MODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(compression());

// تشغيل الراوتس وقاعدة البيانات
init(app);
DbConnection();

app.set('trust proxy', 1);
const port = process.env.PORT || 3018;
const server = app.listen(port, async () => {
  console.log(`server is running on port ${port}...💯`);
});

process.on('unhandledRejection', (err) => {
  console.log('closing the server due to unhandledRejection💥!!');
  console.log('unhandledRejection', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});