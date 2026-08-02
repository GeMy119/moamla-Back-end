import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../../databases/models/admin.model.js";
import { AppErr } from "../../utils/AppErr.js";

// @desc    تسجيل أدمن جديد
// @route   POST /api/admin/register
export const registerAdmin = asyncHandler(async (req, res, next) => {
    const existing = await Admin.findOne({ userName: req.body.userName });
    if (existing) return next(new AppErr("اسم المستخدم مسجل مسبقاً", 400));

    const admin = await Admin.create(req.body);

    res.status(201).json({
        success: true,
        message: "تم إنشاء حساب الأدمن بنجاح",
        data: { _id: admin._id, userName: admin.userName },
    });
});

// @desc    تسجيل دخول الأدمن
// @route   POST /api/admin/login
export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { userName, password } = req.body;

    const admin = await Admin.findOne({ userName });
    if (!admin) return next(new AppErr("اسم المستخدم أو كلمة المرور غير صحيحة", 401));

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return next(new AppErr("اسم المستخدم أو كلمة المرور غير صحيحة", 401));

    const token = jwt.sign(
        { user: { _id: admin._id, role: "admin" } },
        process.env.TOKEN_SK,
    );

    res.status(200).json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        token,
        data: { _id: admin._id, userName: admin.userName, role: admin.role },
    });
});

// @desc    جلب بيانات الأدمن الحالي
// @route   GET /api/admin/me
export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: { _id: req.user._id, userName: req.user.userName },
    });
});

// @desc    تغيير كلمة المرور
// @route   PUT /api/admin/change-password
export const changePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user._id);
    if (!admin) return next(new AppErr("الأدمن غير موجود", 404));

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return next(new AppErr("كلمة المرور القديمة غير صحيحة", 401));

    admin.password = newPassword; // الـ pre('save') هيعمل hash تلقائي
    await admin.save();

    res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
});