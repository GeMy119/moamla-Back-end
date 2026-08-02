import asyncHandler from "express-async-handler";
import Employer from "../../../databases/models/employers.model.js";
import { AppErr } from "../../utils/AppErr.js";
import { generateUniqueSourceNumber } from "../../utils/generateUniqeSourceNumber.js";
import { get } from "mongoose";

// @desc    إنشاء صاحب عمل جديد
// @route   POST /api/employers
export const createEmployer = asyncHandler(async (req, res, next) => {

    const { identity_number } = req.body;

    const existingEmployer = await Employer.findOne({ identity_number });
    if (existingEmployer) {
        return next(new AppErr("رقم الهوية مسجل مسبقاً", 400));
    }

    delete req.body.source_number;

    const source_number = await generateUniqueSourceNumber(Employer, { length: 10, prefix: "" });

    const employer = await Employer.create({ ...req.body, source_number });

    return res.status(201).json({
        success: true,
        message: "تم إنشاء صاحب العمل بنجاح",
        data: employer,
    });
});

// @desc    جلب جميع أصحاب العمل
// @route   GET /api/employers
export const getAllEmployers = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [employers, total] = await Promise.all([
        Employer.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Employer.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        data: employers,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
        },
    });
});

// @desc    جلب صاحب عمل بالـ ID
// @route   GET /api/employers/:id
export const getEmployerById = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    res.status(200).json({
        success: true,
        data: employer,
    });
});

// @desc    تحديث صاحب عمل
// @route   PUT /api/employers/:id
export const updateEmployer = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    // لو بيغير رقم الهوية، تحقق إنه مش مكرر
    if (req.body.identity_number && req.body.identity_number !== employer.identity_number) {
        const duplicate = await Employer.findOne({ identity_number: req.body.identity_number });
        if (duplicate) {
            return next(new AppErr("رقم الهوية مسجل مسبقاً", 400));
        }
    }

    const updated = await Employer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "تم التحديث بنجاح",
        data: updated,
    });
});

// @desc    حذف صاحب عمل
// @route   DELETE /api/employers/:id
export const deleteEmployer = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    await employer.deleteOne();

    res.status(200).json({
        success: true,
        message: "تم الحذف بنجاح",
    });
});
// @desc    إضافة / تحديث تصريح الزواج
// @route   POST /api/employers/:id/marriage-permit
export const addMarriagePermit = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    if (employer.marriage_permit?.status) {
        return next(new AppErr("يوجد تصريح زواج مسجل مسبقاً، استخدم التحديث بدلاً من ذلك", 400));
    }

    // 1. توليد رقم صادر فريد خاص بتصريح الزواج والتحقق من عدم تكراره في الموديل
    const source_number = await generateUniqueSourceNumber(Employer, {
        length: 10,
        prefix: "", // ضف بادئة لو محتاج
        fieldName: "marriage_permit.source_number" // 👈 للتحقق داخل حقل تصريح الزواج
    });

    // 2. تعيين بيانات تصريح الزواج وتدمج معها رقم الصادر المُولَّد
    employer.marriage_permit = {
        ...req.body,
        source_number,
        type: "تصريح زواج",
    };

    await employer.save();

    res.status(201).json({
        success: true,
        message: "تم إضافة تصريح الزواج بنجاح",
        data: employer.marriage_permit,
    });
});

// @desc    تحديث تصريح الزواج
// @route   PUT /api/employers/:id/marriage-permit
export const updateMarriagePermit = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    if (!employer.marriage_permit?.status) {
        return next(new AppErr("لا يوجد تصريح زواج لهذا الكفيل، أضف تصريح أولاً", 404));
    }

    // دمج البيانات الجديدة مع القديمة
    Object.assign(employer.marriage_permit, req.body);

    // الحقول الثابتة لا تتغير
    employer.marriage_permit.type = "تصريح زواج";
    employer.marriage_permit.file_number = req.body.file_number;
    await employer.save();

    res.status(200).json({
        success: true,
        message: "تم تحديث تصريح الزواج بنجاح",
        data: employer.marriage_permit,
    });
});

// @desc    جلب تصريح الزواج (أدمن بالـ ID / يوزر بالبحث)
// @route   GET /api/employers/marriage-permit
export const getMarriagePermit = asyncHandler(async (req, res, next) => {

    const { identity_number, source_number } = req.query;
    if (!identity_number || !source_number) {
        return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));
    }
    const employer = await Employer.findOneAndUpdate(
        { identity_number, source_number },
        {
            $set: { "marriage_permit.lastSearchedAt": new Date() },
        },
        { new: true }

    );
    console.log(employer.marriage_permit.lastSearchedAt)


    if (!employer) {
        return next(new AppErr("لا يوجد كفيل بهذه البيانات", 404));
    }

    if (!employer.marriage_permit?.status) {
        return next(new AppErr("لا يوجد تصريح زواج لهذا الكفيل", 404));
    }

    res.status(200).json({
        success: true,
        data: { employer },
    });
});
export const addTicketVisaReview = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }
    const newTicketVisaReview = req.body.ticket_visa_review; // مصفوفة من الكائنات

    // دمج المصفوفة الجديدة مع المصفوفة القديمة
    employer.ticket_visa_review = [...(employer.ticket_visa_review || []), ...newTicketVisaReview];
    await employer.save();

    res.status(201).json({
        success: true,
        message: "تم إضافة مراجعة تذاكر التأشيرات بنجاح",
        data: employer.ticket_visa_review,
    });
})

export const getTicketVisaReview = asyncHandler(async (req, res, next) => {
    let employer;

    if (req.user.role === "admin") {
        // الأدمن - بيجي الـ id من الـ query
        const { id } = req.query;
        if (!id) {
            return next(new AppErr("الكفيل غير موجود", 404));
        }
        employer = await Employer.findById(id);
    } else {
        // اليوزر - بيبحث برقم الهوية ورقم الصادر
        const { identity_number, source_number } = req.query;
        if (!identity_number || !source_number) {
            return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 404));
        }
        employer = await Employer.findOne(
            { identity_number, source_number }
        );
    }
    res.status(200).json({
        success: true,
        data: { employer },
    });

})

export const updateTicketVisaReview = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    const { reviewId } = req.params; // هيجي من الراوت
    const item = employer.ticket_visa_review.id(reviewId);

    if (!item) {
        return next(new AppErr("العنصر غير موجود", 404));
    }

    // نحدث الحقول اللي جاية في الـ body بس
    const { nationality, profession, arrival_port, count } = req.body;
    if (nationality !== undefined) item.nationality = nationality;
    if (profession !== undefined) item.profession = profession;
    if (arrival_port !== undefined) item.arrival_port = arrival_port;
    if (count !== undefined) item.count = count;

    await employer.save();

    res.status(200).json({
        success: true,
        message: "تم تحديث المراجعة بنجاح",
        data: employer.ticket_visa_review,
    });
});
export const deleteTicketVisaReview = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.id);
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    const { reviewId } = req.params;

    const item = employer.ticket_visa_review.id(reviewId);

    if (!item) {
        return next(new AppErr("العنصر غير موجود", 404));
    }

    item.deleteOne();

    const saved = await employer.save();
    console.log("saved successfully:", !!saved);

    res.status(200).json({
        success: true,
        message: "تم حذف المراجعة بنجاح",
        data: employer.ticket_visa_review,
    });
});
