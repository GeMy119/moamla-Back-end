import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 0.5 * 60 * 2000, // 0.5 minutes
  limit: 2000, // Limit each user to 10 requests per windowMs
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false,
  message:
    'Too many requests from this user. Please try again after 15 minutes.',
});
