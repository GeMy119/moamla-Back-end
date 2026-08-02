import mongoose from 'mongoose';
import 'dotenv/config';

const dbUrl =
  process.env.MODE_ENV === 'production'
    ? process.env.DB_URL_LIVE
    : process.env.DB_URL_TEST;
const message = process.env.MODE_ENV === 'production' ? 'Live' : 'Test';
export function DbConnection() {
  mongoose
    .connect(`${dbUrl}`)
    .then(() => {
      console.log(`MongoDB Connection Succeeded ${message}🔥`);
    })
    .catch((err) => {
      console.log('Connection error 😥', err);
    });
}
