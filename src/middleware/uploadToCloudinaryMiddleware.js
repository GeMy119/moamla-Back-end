import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import asyncHandler from "express-async-handler";
import { AppErr } from '../utils/AppErr.js';


const quality = 15;

const cloudOption = () => {
    const storage = multer.memoryStorage();
    function fileFilter(req, file, cb) {
        if (!file) {
            return cb(null, true);
        }
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            return cb(new AppErr('امتداد الملف غير مسموح به.', 400), false);
        }
        cb(null, true);
    }
    return multer({ storage, fileFilter });
};

const uploadAndProcessForCloudinary = (folder, fieldName) => {
    return [
        cloudOption().single(fieldName),
        async (req, res, next) => { // 👈 شلنا asyncHandler هنا لأن الـ try...catch بتغطي الأخطاء
            try {
                if (!req.file) {
                    return next();
                }

                const fileType = path.extname(req.file.originalname).toLowerCase();

                if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
                    try {
                        req.file.buffer = await sharp(req.file.buffer)
                            .rotate()
                            .jpeg({ quality, withMetadata: false })
                            .toBuffer();
                    } catch (err) {
                        console.error(`Error processing image: ${err.message}`);
                    }
                }

                req.uploadFolder = folder;

                next();
            } catch (err) {
                next(err);
            }
        },
    ];
};

export default uploadAndProcessForCloudinary;