import asyncHandler from "express-async-handler";
import FamilyVisas from "../../../databases/models/family_visas.model.js";
import Worker from "../../../databases/models/worker.model.js";
import { AppErr } from "../../utils/AppErr.js";
import { generateUniqueSourceNumber } from "../../utils/generateUniqeSourceNumber.js";

// @desc    إنشاء تأشيرة عائلية جديدة
// @route   POST /api/family-visas
export const createFamilyVisa = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.body.worker_id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    // 1. توليد رقم صادر فريد لموديل التأشيرات العائلية (مع استخدام await)
    const source_number = await generateUniqueSourceNumber(FamilyVisas, {
        length: 10,
        prefix: ""
    });

    // 2. دمج الرقم المولد مع البيانات القادمة من req.body
    const familyVisa = await FamilyVisas.create({
        ...req.body,
        source_number
    });

    res.status(201).json({
        success: true,
        message: "تم إنشاء التأشيرة العائلية بنجاح",
        data: familyVisa,
    });
});

// @desc    جلب جميع التأشيرات العائلية (أدمن فقط)
// @route   GET /api/family-visas
export const getAllFamilyVisas = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.worker_id) filter.worker_id = req.query.worker_id;
    if (req.query.purpose) filter.purpose = req.query.purpose;
    if (req.query.nationality) filter.nationality = req.query.nationality;
    if (req.query.status) filter.status = req.query.status;

    const [visas, total] = await Promise.all([
        FamilyVisas.find(filter)
            .populate("worker_id", "name identity_number iqama_number")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        FamilyVisas.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: visas,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
});

// @desc    جلب تأشيرات عائلية (أدمن بالـ id / يوزر بالبحث برقم الهوية ورقم الصادر)
// @route   GET /api/family-visas/search
export const getFamilyVisas = asyncHandler(async (req, res, next) => {
    let worker;
    if (req.user.role === "admin") {
        const { id } = req.query;
        if (!id) return next(new AppErr("id العامل مطلوب", 400));

        worker = await Worker.findById(id);
    } else {
        const { identity_number, source_number, purpose } = req.query;
        if (!identity_number || !source_number)
            return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));

        worker = await Worker.findOne({ identity_number, source_number, purpose });
    }

    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    const visas = await FamilyVisas.find({ worker_id: worker._id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: visas.length,
        worker: {
            name: worker.name,
            identity_number: worker.identity_number,
            source_number: worker.source_number,
        },
        data: visas,
    });
});
export const getFamilyVisasUser = asyncHandler(async (req, res, next) => {

    const { identity_number, source_number, purpose } = req.query;
    if (!identity_number || !source_number)
        return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));

    const worker = await Worker.findOne({ identity_number }).populate("employer_id", "name identity_number source_number company_name address");


    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    const visa = await FamilyVisas.findOne({ worker_id: worker._id, source_number }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        worker: {
            name: worker.name,
            identity_number: worker.identity_number,
            source_number: worker.source_number,
            employer: worker.employer_id,
            employer_name: worker.employer_id.name,
            employer_identity_number: worker.employer_id.identity_number,
            employer_source_number: worker.employer_id.source_number,
        },
        data: visa,
    });
});

// @desc    جلب تأشيرة عائلية بالـ ID
// @route   GET /api/family-visas/:id
export const getFamilyVisaById = asyncHandler(async (req, res, next) => {
    const visa = await FamilyVisas.findById(req.params.id)
        .populate("worker_id", "name identity_number iqama_number nationality");

    if (!visa) return next(new AppErr("التأشيرة العائلية غير موجودة", 404));

    res.status(200).json({ success: true, data: visa });
});

// @desc    تحديث تأشيرة عائلية
// @route   PUT /api/family-visas/:id
export const updateFamilyVisa = asyncHandler(async (req, res, next) => {
    const visa = await FamilyVisas.findById(req.params.id);
    if (!visa) return next(new AppErr("التأشيرة العائلية غير موجودة", 404));

    if (req.body.worker_id && req.body.worker_id !== String(visa.worker_id)) {
        const worker = await Worker.findById(req.body.worker_id);
        if (!worker) return next(new AppErr("العامل الجديد غير موجود", 404));
    }

    const updated = await FamilyVisas.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate("worker_id", "name identity_number");

    res.status(200).json({
        success: true,
        message: "تم تحديث التأشيرة العائلية بنجاح",
        data: updated,
    });
});

// @desc    حذف تأشيرة عائلية
// @route   DELETE /api/family-visas/:id
export const deleteFamilyVisa = asyncHandler(async (req, res, next) => {
    const visa = await FamilyVisas.findById(req.params.id);
    if (!visa) return next(new AppErr("التأشيرة العائلية غير موجودة", 404));

    await visa.deleteOne();

    res.status(200).json({ success: true, message: "تم حذف التأشيرة العائلية بنجاح" });
});