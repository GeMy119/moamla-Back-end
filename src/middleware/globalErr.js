import { AppErr } from '../utils/AppErr.js';
import logger from '../utils/logger.js';

const handelCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppErr(message, 400);
};

const handelDuPlicateError = (err) => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppErr(message, 400);
};

const handelValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppErr(message, 400);
};

const handelJsonWebTokenError = (err) => {
  let message = `Invalid token. ${err.message}`;
  return new AppErr(message, 401);
};

const sendErrProduction = async (err, res, req) => {
  if (err.isOperationlError) {
    let statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error({
      message: 'Programming error occurred',
      error: err,
      stack: err.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
      },
    });
    console.error(`Programming error occurred At ${new Date()}`);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const sendErrDeveolpment = async (err, res, req) => {
  let statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

export const globalErr = async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // ✅ استخدمنا MODE_ENV بدل NODE_ENV في كل الشروط دي
  if (process.env.MODE_ENV == 'development') {
    await sendErrDeveolpment(err, res, req);
  } else if (
    process.env.MODE_ENV == 'prod' ||
    process.env.MODE_ENV == 'production'
  ) {
    let error = { ...err };
    error.message = err.message;

    if (error?.name == 'CastError') error = handelCastError(error);
    if (error?.code === 11000) error = handelDuPlicateError(error);
    if (error?.name == 'ValidationError') error = handelValidationError(error);
    if (error?.name == 'JsonWebTokenError' || error?.name == 'TokenExpiredError')
      error = handelJsonWebTokenError(error);

    await sendErrProduction(error, res, req);
  } else {
    await sendErrDeveolpment(err, res, req);
  }
};