import streamifier from "streamifier"
import cloudinary from "./cloudinary.js";
/**
 * رفع ملف لـ Cloudinary من buffer (لما بتستخدم multer.memoryStorage())
 * @param {Buffer} fileBuffer - buffer الملف
 * @param {string} folder - اسم الفولدر في Cloudinary (اختياري)
 * @returns {Promise<object>} - نتيجة الرفع (فيها secure_url, public_id, ...)
 */
function uploadToCloudinary(fileBuffer, folder = 'uploads') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto', // يدعم صور، فيديو، ملفات
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
}

export default uploadToCloudinary;