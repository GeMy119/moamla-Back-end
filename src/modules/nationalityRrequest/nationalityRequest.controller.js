import asyncHandler from "express-async-handler";
import NationalityRequest from "../../../databases/models/nationality_request.model.js";
import { AppErr } from "../../utils/AppErr.js";
import { generateUniqueSourceNumber } from "../../utils/generateUniqeSourceNumber.js";
import uploadToCloudinary from "../../utils/uploadToCludinary.js";
import cloudinary from "../../utils/cloudinary.js";

// @desc    إنشاء طلب جنسية جديد
// @route   POST /api/nationality-requests
// export const createNationalityRequest = asyncHandler(async (req, res, next) => {
//     if (!req.file) return next(new AppErr("صورة الطلب مطلوبة", 400));
//     const source_number = await generateUniqueSourceNumber(NationalityRequest, { length: 10 })
//     const nationalityRequest = await NationalityRequest.create({
//         ...req.body,
//         image_URL: req.file.filename, // post('init') هيكمّل الرابط الكامل وقت القراءة
//         source_number: source_number,
//     });

//     res.status(201).json({
//         success: true,
//         message: "تم إنشاء طلب الجنسية بنجاح",
//         data: nationalityRequest,
//     });
// });
export const createNationalityRequest = asyncHandler(async (req, res, next) => {
    if (!req.file) return next(new AppErr("صورة الطلب مطلوبة", 400));
    const source_number = await generateUniqueSourceNumber(NationalityRequest, { length: 10 })

    const result = await uploadToCloudinary(req.file.buffer, req.uploadFolder);

    const nationalityRequest = await NationalityRequest.create({
        ...req.body,
        source_number,
        image_URL: result.secure_url,
        image_public_id: result.public_id,
    });

    res.status(201).json({
        success: true,
        message: "تم إنشاء طلب الجنسية بنجاح",
        data: nationalityRequest,
    });
});

// @desc    جلب جميع طلبات الجنسية
// @route   GET /api/nationality-requests
export const getAllNationalityRequests = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.job) filter.job = req.query.job;

    const [requests, total] = await Promise.all([
        NationalityRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        NationalityRequest.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: requests,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
});

// @desc    جلب طلب جنسية بالـ ID
// @route   GET /api/nationality-requests/:id
export const getNationalityRequestById = asyncHandler(async (req, res, next) => {
    const request = await NationalityRequest.findById(req.params.id);
    if (!request) return next(new AppErr("طلب الجنسية غير موجود", 404));

    res.status(200).json({ success: true, data: request });
});

// @desc    البحث برقم المعاملة أو الرقم التسلسلي
// @route   GET /api/nationality-requests/search?application_number=&serial_number=
export const searchNationalityRequest = asyncHandler(async (req, res, next) => {
    const { identity_number, source_number } = req.query;

    if (!identity_number && !source_number) {
        return next(new AppErr("رقم الهوية أو رقم المعاملة مطلوب", 400));
    }

    const filter = {};
    if (identity_number) filter.identity_number = identity_number;
    if (source_number) filter.source_number = source_number;

    const request = await NationalityRequest.findOne(filter);
    if (!request) return next(new AppErr("لا يوجد طلب بهذه البيانات", 404));

    res.status(200).json({ success: true, data: request });
});

// @desc    تحديث طلب جنسية
// @route   PUT /api/nationality-requests/:id
// export const updateNationalityRequest = asyncHandler(async (req, res, next) => {
//     const request = await NationalityRequest.findById(req.params.id);
//     if (!request) return next(new AppErr("طلب الجنسية غير موجود", 404));

//     const updateData = { ...req.body };

//     // لو في صورة جديدة، حدّث الرابط
//     if (req.file) {
//         updateData.image_URL = req.file.filename;
//     }

//     const updated = await NationalityRequest.findByIdAndUpdate(req.params.id, updateData, {
//         new: true,
//         runValidators: true,
//     });

//     res.status(200).json({
//         success: true,
//         message: "تم تحديث طلب الجنسية بنجاح",
//         data: updated,
//     });
// });
export const updateNationalityRequest = asyncHandler(async (req, res, next) => {
    const request = await NationalityRequest.findById(req.params.id);
    if (!request) return next(new AppErr("طلب الجنسية غير موجود", 404));

    const updateData = { ...req.body };

    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, req.uploadFolder);

        if (request.image_public_id) {
            await cloudinary.uploader.destroy(request.image_public_id);
        }

        updateData.image_URL = result.secure_url;
        updateData.image_public_id = result.public_id;
    }
    const updated = await NationalityRequest.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: "تم تحديث طلب الجنسية بنجاح",
        data: updated,
    });
});

// @desc    حذف طلب جنسية
// @route   DELETE /api/nationality-requests/:id
// export const deleteNationalityRequest = asyncHandler(async (req, res, next) => {
//     const request = await NationalityRequest.findById(req.params.id);
//     if (!request) return next(new AppErr("طلب الجنسية غير موجود", 404));

//     await request.deleteOne();

//     res.status(200).json({ success: true, message: "تم حذف طلب الجنسية بنجاح" });
// });
export const deleteNationalityRequest = asyncHandler(async (req, res, next) => {
    const request = await NationalityRequest.findById(req.params.id);
    if (!request) return next(new AppErr("طلب الجنسية غير موجود", 404));
    if (request.image_public_id) {
        await cloudinary.uploader.destroy(request.image_public_id);
    }
    await request.deleteOne();

    res.status(200).json({ success: true, message: "تم حذف طلب الجنسية بنجاح" });
});