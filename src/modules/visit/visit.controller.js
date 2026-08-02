import asyncHandler from "express-async-handler";
import Visit from "../../../databases/models/visit.model.js";
import { AppErr } from "../../utils/AppErr.js";
import { generateUniqueSourceNumber } from "../../utils/generateUniqeSourceNumber.js";
import uploadToCloudinary from "../../utils/uploadToCludinary.js";
import cloudinary from "../../utils/cloudinary.js";

// @desc    إنشاء تأشيرة زيارة جديدة
// @route   POST /api/visits
// export const createVisit = asyncHandler(async (req, res, next) => {
//     const source_number = await generateUniqueSourceNumber(Visit, { length: 10 });
//     if (!req.file) return next(new AppErr("صورة التأشيرة مطلوبة", 400));

//     const visit = await Visit.create({
//         ...req.body,
//         source_number,
//         image_url: req.file.filename,
//     });
//     console.log(visit)
//     res.status(201).json({
//         success: true,
//         message: "تم إنشاء تأشيرة الزيارة بنجاح",
//         data: visit,
//     });
// });
export const createVisit = asyncHandler(async (req, res, next) => {
    if (!req.file) return next(new AppErr("صورة التأشيرة مطلوبة", 400));

    const source_number = await generateUniqueSourceNumber(Visit, { length: 10 });

    const result = await uploadToCloudinary(req.file.buffer, req.uploadFolder);

    const visit = await Visit.create({
        ...req.body,
        source_number,
        image_url: result.secure_url,
        image_public_id: result.public_id,
    });

    res.status(201).json({
        success: true,
        message: "تم إنشاء تأشيرة الزيارة بنجاح",
        data: visit,
    });
});
// @desc    جلب جميع تأشيرات الزيارة (أدمن)
// @route   GET /api/visits
export const getAllVisits = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.nationality) filter.nationality = req.query.nationality;
    if (req.query.typeOfVisa) filter.typeOfVisa = req.query.typeOfVisa;

    const [visits, total] = await Promise.all([
        Visit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Visit.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: visits,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
});

// @desc    بحث عن تأشيرة زيارة (يوزر برقم التأشيرة وجواز السفر / أدمن بالـ id)
// @route   GET /api/visits/search
export const searchVisit = asyncHandler(async (req, res, next) => {
    let visit;

    if (req.user.role === "admin") {
        const { id } = req.query;
        if (!id) return next(new AppErr("id التأشيرة مطلوب", 400));
        visit = await Visit.findById(id);
    } else {
        const { visaNo } = req.query;
        if (!visaNo)
            return next(new AppErr("رقم التأشيرة مطلوب", 400));
        visit = await Visit.findOne({ visaNo });
    }

    if (!visit) return next(new AppErr("لا يوجد تأشيرة بهذه البيانات", 404));

    res.status(200).json({ success: true, data: visit });
});
export const searchVisitUser = asyncHandler(async (req, res, next) => {

    const { visaNo, source_number } = req.query;
    if (!visaNo || !source_number)
        return next(new AppErr("رقم التأشيرة ومصدرها مطلوبان", 400));
    const visit = await Visit.findOneAndUpdate(
        { visaNo, source_number },
        {
            $set: { lastSearchedAt: new Date() } // تحديث التاريخ والوقت الحالي
        },
        { new: true } // لإرجاع البيانات بعد التحديث مباشرةً
    );
    if (!visit) return next(new AppErr("لا يوجد تأشيرة بهذه البيانات", 404));
    res.status(200).json({ success: true, data: visit });
});

// @desc    تحديث تأشيرة زيارة
// @route   PUT /api/visits/:id
// export const updateVisit = asyncHandler(async (req, res, next) => {
//     const visit = await Visit.findById(req.params.id);
//     if (!visit) return next(new AppErr("تأشيرة الزيارة غير موجودة", 404));

//     if (req.body.visaNo && req.body.visaNo !== visit.visaNo) {
//         const duplicate = await Visit.findOne({ visaNo: req.body.visaNo });
//         if (duplicate) return next(new AppErr("رقم التأشيرة مسجل مسبقاً", 400));
//     }

//     const updateData = { ...req.body };
//     if (req.file) {
//         updateData.image_url = req.file.filename;
//     }

//     const updated = await Visit.findByIdAndUpdate(req.params.id, updateData, {
//         new: true,
//         runValidators: true,
//     });

//     res.status(200).json({
//         success: true,
//         message: "تم تحديث تأشيرة الزيارة بنجاح",
//         data: updated,
//     });
// });


export const updateVisit = asyncHandler(async (req, res, next) => {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return next(new AppErr("تأشيرة الزيارة غير موجودة", 404));

    if (req.body.visaNo && req.body.visaNo !== visit.visaNo) {
        const duplicate = await Visit.findOne({ visaNo: req.body.visaNo });
        if (duplicate) return next(new AppErr("رقم التأشيرة مسجل مسبقاً", 400));
    }

    const updateData = { ...req.body };

    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, req.uploadFolder);

        if (visit.image_public_id) {
            await cloudinary.uploader.destroy(visit.image_public_id);
        }

        updateData.image_url = result.secure_url;
        updateData.image_public_id = result.public_id;
    }

    const updated = await Visit.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: "تم تحديث تأشيرة الزيارة بنجاح",
        data: updated,
    });
});


// @desc    حذف تأشيرة زيارة
// @route   DELETE /api/visits/:id
// export const deleteVisit = asyncHandler(async (req, res, next) => {
//     const visit = await Visit.findById(req.params.id);
//     if (!visit) return next(new AppErr("تأشيرة الزيارة غير موجودة", 404));

//     await visit.deleteOne();

//     res.status(200).json({ success: true, message: "تم حذف تأشيرة الزيارة بنجاح" });
// });


export const deleteVisit = asyncHandler(async (req, res, next) => {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return next(new AppErr("تأشيرة الزيارة غير موجودة", 404));

    // احذف الصورة من Cloudinary الأول (لو موجودة)
    if (visit.image_public_id) {
        await cloudinary.uploader.destroy(visit.image_public_id);
    }

    await visit.deleteOne();

    res.status(200).json({ success: true, message: "تم حذف تأشيرة الزيارة بنجاح" });
});