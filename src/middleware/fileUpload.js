import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { AppErr } from '../utils/AppErr.js';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from "express-async-handler";

const quality = 15;

const option = () => {
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

const uploadAndprocessFile = (uploadDir, fieldName) => {
  uploadDir = path.join('uploads', uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return [
    option().single(fieldName),
    asyncHandler(async (req, res, next) => {
      try {
        if (!req.file) {
          return next();
        }

        const fileType = path.extname(req.file.originalname);
        let processedBuffer;

        if (['.jpg', '.jpeg', '.png'].includes(fileType)) {
          try {
            processedBuffer = await sharp(req.file.buffer)
              .rotate()
              .jpeg({ quality, withMetadata: false })
              .toBuffer();
          } catch (err) {
            console.error(`Error processing image: ${err.message}`);
            processedBuffer = req.file.buffer;
          }
        } else if (fileType === '.pdf') {
          processedBuffer = req.file.buffer;
        }
        const fileName = `${uuidv4()}-${req.file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, processedBuffer);

        req.file.path = filePath;
        req.file.filename = fileName;

        next();
      } catch (err) {
        next(err);
      }
    }),
  ];
};

const uploadAndProcessFiles = (uploadDir, arrayOfFields) => {
  uploadDir = path.join('uploads', uploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return [
    option().fields(arrayOfFields),
    asyncHandler(async (req, res, next) => {
      const processImage = async (file) => {
        try {
          if (!req.files) {
            return next();
          }
          const compressedBuffer = await sharp(file.buffer)
            .rotate()
            .jpeg({ quality, withMetadata: false })
            .toBuffer();

          const fileName = `${uuidv4()}-${file.originalname}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, compressedBuffer);

          file.path = filePath;
          file.filename = fileName;
        } catch (err) {
          console.error(
            `Error processing image: ${file.originalname}, ${err.message}`
          );
        }
      };

      const saveFile = (file) => {
        try {
          const fileName = `${uuidv4()}-${file.originalname}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, file.buffer);

          // Update file metadata for later use
          file.path = filePath;
          file.filename = fileName;
        } catch (err) {
          console.error(
            `Error saving file: ${file.originalname}, ${err.message}`
          );
        }
      };

      for (const fieldName in req.files) {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];

        const files = req.files[fieldName];

        // Iterate over each file in the field
        await Promise.all(
          files.map(async (file) => {
            const extension = path.extname(file.originalname);
            if (allowedExtensions.includes(extension)) {
              await processImage(file);
            } else {
              await saveFile(file);
            }
          })
        );
      }
      next();
    }),
  ];
};

export { uploadAndprocessFile, uploadAndProcessFiles };
