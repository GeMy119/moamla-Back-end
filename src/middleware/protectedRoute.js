import jwt from 'jsonwebtoken';
import { AppErr } from '../utils/AppErr.js';
import asyncHandler from "express-async-handler";
import Admin from '../../databases/models/admin.model.js';
export const protectedRoutes = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next(new AppErr('token not provided', 404));

  let decoded = jwt.verify(token, `${process.env.TOKEN_SK}`);
  let user = await Admin.findById(decoded.user._id);

  if (!user) {
    return next(new AppErr('invalid token', 401));
  }
  user.role = decoded.user.role;
  req.user = user;
  next();
});


export const allowTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppErr(
          'you are not authorized to access this route . you are ' +
          req.user.role,
          401
        )
      );

    next();
  });
};
