import asyncHandler from "express-async-handler";
import Worker from "../../../databases/models/worker.model.js";
import Employer from "../../../databases/models/employers.model.js";
import { AppErr } from "../../utils/AppErr.js";
import { generateUniqueSourceNumber } from "../../utils/generateUniqeSourceNumber.js";


// @desc    إنشاء عامل جديد
export const createWorker = asyncHandler(async (req, res, next) => {
    const { employer_id, identity_number } = req.body;

    const employer = await Employer.findById(employer_id);
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    const existingWorker = await Worker.findOne({ identity_number });
    if (existingWorker) {
        return next(new AppErr("رقم الهوية مسجل مسبقاً", 400));
    }

    const source_number = await generateUniqueSourceNumber(Worker, { length: 9 });
    const worker = await Worker.create({ ...req.body, source_number });

    res.status(201).json({
        success: true,
        message: "تم إنشاء العامل بنجاح",
        data: worker,
    });
});

// @desc    جلب جميع العمال
export const getAllWorkers = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.employer_id) filter.employer_id = req.query.employer_id;
    if (req.query.nationality) filter.nationality = req.query.nationality;
    if (req.query.profession) filter.profession = req.query.profession;
    if (req.query.iqama_status) filter.iqama_status = req.query.iqama_status;

    const [workers, total] = await Promise.all([
        Worker.find(filter)
            .populate("employer_id", "name identity_number source_number")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Worker.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: workers,
        pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
});

// @desc    جلب عامل بالـ ID
export const getWorkerById = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id)
        .populate("employer_id", "name identity_number source_number address");

    if (!worker) {
        return next(new AppErr("العامل غير موجود", 404));
    }

    res.status(200).json({ success: true, data: worker });
});

// @desc    جلب عمال صاحب عمل معين
export const getWorkersByEmployerAdmin = asyncHandler(async (req, res, next) => {
    const employer = await Employer.findById(req.params.employerId);
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }
    const workers = await Worker.find({ employer_id: req.params.employerId })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: workers.length,
        employer: {
            name: employer.name,
            identity_number: employer.identity_number,
            source_number: employer.source_number,
            address: employer.address,

        },
        data: workers,
    });
});
export const getWorkersByEmployer = asyncHandler(async (req, res, next) => {
    const { identity_number, source_number } = req.query;
    if (!identity_number || !source_number) {
        return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));
    }
    const employer = await Employer.findOne({ identity_number });
    if (!employer) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    const worker = await Worker.findOne({ employer_id: employer._id, source_number })

    res.status(200).json({
        success: true,
        employer: {
            name: employer.name,
            identity_number: employer.identity_number,
            source_number: employer.source_number,
            company_name: employer.company_name,
            address: employer.address,
            ticket_visa_review: employer.ticket_visa_review,
            file_number: employer.file_number,
            reference_number: employer.reference_number,
            createdAt: employer.createdAt
        },
        data: worker,
    });
});

// @desc    تحديث بيانات العامل الأساسية
export const updateWorker = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
        return next(new AppErr("العامل غير موجود", 404));
    }

    if (req.body.employer_id && req.body.employer_id !== String(worker.employer_id)) {
        const employer = await Employer.findById(req.body.employer_id);
        if (!employer) {
            return next(new AppErr("صاحب العمل الجديد غير موجود", 404));
        }
    }

    if (req.body.identity_number && req.body.identity_number !== worker.identity_number) {
        const duplicate = await Worker.findOne({ identity_number: req.body.identity_number });
        if (duplicate) {
            return next(new AppErr("رقم الهوية مسجل مسبقاً", 400));
        }
    }

    delete req.body.alerts;
    delete req.body.profession_changes;

    const updated = await Worker.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate("employer_id", "name identity_number source_number address");

    res.status(200).json({
        success: true,
        message: "تم تحديث بيانات العامل بنجاح",
        data: updated,
    });
});

// @desc    حذف عامل
export const deleteWorker = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
        return next(new AppErr("العامل غير موجود", 404));
    }

    await worker.deleteOne();

    res.status(200).json({ success: true, message: "تم حذف العامل بنجاح" });
});

// ─────────────────────────────────────────────
//  ALERTS
// ─────────────────────────────────────────────

export const addAlert = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    if (req.body.type === "بلاغ تغيب" && worker.alerts?.status === "accepted") {
        return next(new AppErr("يوجد بلاغ تغيب نشط لهذا العامل مسبقاً", 400));
    }
    const source_number = await generateUniqueSourceNumber(Worker, {
        length: 10,
        prefix: "",
        fieldName: "alerts.source_number"
    });

    worker.alerts = {
        type: req.body.type,
        status: req.body.status,
        filed_date: req.body.filed_date,
        resolved_date: req.body.resolved_date,
        source_number
    };

    await worker.save();

    res.status(201).json({ success: true, message: "تم إضافة البلاغ بنجاح", data: worker.alerts });
});

// بحث عام بدون تسجيل دخول - بيانات الكفيل (رقم الهوية + رقم الصادر)
export const getAlert = asyncHandler(async (req, res, next) => {
    const { identity_number, source_number } = req.query;
    if (!identity_number || !source_number)
        return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));

    const employer = await Employer.findOne({ identity_number });
    if (!employer) return next(new AppErr("الكفيل غير موجود", 404));

    const worker = await Worker.findOne({
        employer_id: employer._id,
        "alerts.source_number": source_number
    });


    res.status(200).json({
        success: true,
        identity_number: employer.identity_number,
        source_number: employer.source_number,
        company_name: employer.company_name,
        name: employer.name,
        createdAt: employer.createdAt,
        worker,
    });
});

export const updateAlert = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    if (!worker.alerts?.type) return next(new AppErr("لا يوجد بلاغ لهذا العامل", 404));

    Object.assign(worker.alerts, req.body);
    await worker.save();

    res.status(200).json({ success: true, message: "تم تحديث البلاغ بنجاح", data: worker.alerts });
});

export const deleteAlert = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    if (!worker.alerts?.type) return next(new AppErr("لا يوجد بلاغ لهذا العامل", 404));

    worker.alerts = {
        type: undefined,
        status: undefined,
        filed_date: undefined,
        resolved_date: undefined,
    };

    await worker.save();

    res.status(200).json({ success: true, message: "تم حذف البلاغ بنجاح" });
});

// ─────────────────────────────────────────────
//  PROFESSION CHANGES
// ─────────────────────────────────────────────

export const addProfessionChange = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));
    const source_number = await generateUniqueSourceNumber(Worker, {
        length: 10,
        prefix: "",
        fieldName: "profession_changes.source_number"
    });
    worker.profession_changes = {
        old_profession: worker.profession,
        status: req.body.status || "accepted",
        change_date: req.body.change_date,
        source_number
    };

    if (worker.profession_changes.status === "accepted" && req.body.new_profession) {
        worker.profession = req.body.new_profession;
    }

    await worker.save();

    res.status(201).json({
        success: true,
        message: "تم تسجيل تغيير المهنة بنجاح",
        data: {
            profession_change: worker.profession_changes,
            current_profession: worker.profession,
        },
    });
});

export const getProfessionChange = asyncHandler(async (req, res, next) => {
    const { identity_number, source_number } = req.query;

    if (!identity_number || !source_number) {
        return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));
    }

    const employer = await Employer.findOne({ identity_number });
    if (!employer) return next(new AppErr("الكفيل غير موجود", 404));
    const worker = await Worker.findOne({
        employer_id: employer._id,
        "profession_changes.source_number": source_number
    });

    if (!worker) {
        return next(new AppErr("لم يتم العثور على سجل تغيير مهنة برقم الصادر المدخل", 404));
    }

    res.status(200).json({
        success: true,
        identity_number: employer.identity_number,
        source_number: employer.source_number,
        company_name: employer.company_name,
        name: employer.name,
        createdAt: employer.createdAt,
        worker
    });
});

// @desc    تحديث تغيير المهنة
// @route   PUT /api/workers/:id/profession-changes
export const updateProfessionChange = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    if (!worker.profession_changes?.change_date) {
        return next(new AppErr("لا يوجد تغيير مهنة لهذا العامل", 404));
    }

    const { status, change_date, new_profession } = req.body;

    if (status !== undefined) worker.profession_changes.status = status;
    if (change_date !== undefined) worker.profession_changes.change_date = change_date;

    // لو الحالة اتحدثت لـ accepted وفيه new_profession، حدّث المهنة الحالية
    if (worker.profession_changes.status === "accepted" && new_profession) {
        worker.profession = new_profession;
    }
    else if (worker.profession_changes.status === "rejected") {
        // لو الحالة اتحدثت لـ rejected، رجّع المهنة الحالية للمهنة القديمة
        worker.profession = worker.profession_changes.old_profession;
    }

    await worker.save();

    res.status(200).json({
        success: true,
        message: "تم تحديث تغيير المهنة بنجاح",
        data: {
            profession_change: worker.profession_changes,
            current_profession: worker.profession,
        },
    });
});

// @desc    حذف تغيير المهنة
// @route   DELETE /api/workers/:id/profession-changes
export const deleteProfessionChange = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("العامل غير موجود", 404));

    if (!worker.profession_changes?.change_date) {
        return next(new AppErr("لا يوجد تغيير مهنة لهذا العامل", 404));
    }

    worker.profession_changes = {
        old_profession: undefined,
        status: undefined,
        change_date: undefined,
    };

    await worker.save();

    res.status(200).json({ success: true, message: "تم حذف تغيير المهنة بنجاح" });
});

export const addMoamlaType = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    console.log(req.body)
    if (!worker) {
        return next(new AppErr("العامل غير موجود", 404));
    }
    const bodyData = Array.isArray(req.body) ? req.body[0] : req.body;
    // توليد رقم صادر فريد لنوع المعاملة
    const source_number = await generateUniqueSourceNumber(Worker, {
        length: 10,
        prefix: "",
        fieldName: "moamla_type.source_number"
    });

    // تجهيز عنصر المعاملة الجديدة
    const newMoamlaType = { ...bodyData, source_number };
    console.log(newMoamlaType)
    // إضافة المعاملة الجديدة إلى مصفوفة المعاملات
    if (!worker.moamla_type) {
        worker.moamla_type = [];
    }
    worker.moamla_type.push(newMoamlaType);
    console.log(worker.moamla_type)
    await worker.save();

    res.status(201).json({
        success: true,
        message: "تم إضافة نوع المعاملة بنجاح",
        data: worker.moamla_type,
    });
});

export const updateMoamlaType = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return next(new AppErr("صاحب العمل غير موجود", 404));

    const moamla = worker.moamla_type.id(req.params.moamlaId);
    if (!moamla) return next(new AppErr("نوع المعاملة غير موجود", 404));

    // لو الـ body array فيه عنصر واحد بس بيمثل التحديث
    const updateData = Array.isArray(req.body) ? req.body[0] : req.body;

    if (updateData.name !== undefined) moamla.name = updateData.name;
    if (updateData.status !== undefined) moamla.status = updateData.status;

    await worker.save();

    res.status(200).json({
        success: true,
        message: "تم تحديث نوع المعاملة",
        data: worker.moamla_type,
    });
});
export const deleteMoamlaType = asyncHandler(async (req, res, next) => {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
        return next(new AppErr("صاحب العمل غير موجود", 404));
    }

    const { moamlaId } = req.params;

    const item = worker.moamla_type.id(moamlaId);   // ← تم التصحيح

    if (!item) {
        return next(new AppErr("العنصر غير موجود", 404));
    }

    item.deleteOne();

    const saved = await worker.save();
    console.log("saved successfully:", !!saved);

    res.status(200).json({
        success: true,
        message: "تم حذف المراجعة بنجاح",
        data: worker.moamla_type,
    });
});
export const getMoamlaTypeBySourceNumber = asyncHandler(async (req, res, next) => {
    const { identity_number, source_number } = req.query;

    if (!identity_number || !source_number) {
        return next(new AppErr("رقم الهوية ورقم الصادر مطلوبان", 400));
    }

    const employer = await Employer.findOne({ identity_number });
    if (!employer) return next(new AppErr("الكفيل غير موجود", 404));

    const worker = await Worker.findOne({
        employer_id: employer._id,
    });

    if (!worker) {
        return next(new AppErr("لم يتم العثور على معاملة برقم الصادر المدخل لهذا العامل", 404));
    }

    const moamlaItem = worker.moamla_type?.find(
        (item) => item.source_number === source_number
    );

    res.status(200).json({
        success: true,
        identity_number: employer.identity_number,
        source_number: employer.source_number,
        company_name: employer.company_name,
        name: employer.name,
        createdAt: employer.createdAt,
        data: {
            worker_id: worker._id,
            name: worker.name,
            identity_number: worker.identity_number,
            profession: worker.profession,
            nationality: worker.nationality,
            iqama_number: worker.iqama_number,
            moamla: moamlaItem
        }
    });
});