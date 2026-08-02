import Joi from "joi";

export const registerAdminSchema = Joi.object({
    userName: Joi.string().min(3).max(50).required().messages({
        "string.empty": "اسم المستخدم مطلوب",
        "string.min": "اسم المستخدم يجب أن يكون 3 أحرف على الأقل",
        "any.required": "اسم المستخدم مطلوب",
    }),

    password: Joi.string().min(6).max(100).required().messages({
        "string.empty": "كلمة المرور مطلوبة",
        "string.min": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        "any.required": "كلمة المرور مطلوبة",
    }),
    role: Joi.string().optional()
});

export const loginAdminSchema = Joi.object({
    userName: Joi.string().required().messages({
        "string.empty": "اسم المستخدم مطلوب",
        "any.required": "اسم المستخدم مطلوب",
    }),

    password: Joi.string().required().messages({
        "string.empty": "كلمة المرور مطلوبة",
        "any.required": "كلمة المرور مطلوبة",
    }),
});

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        "string.empty": "كلمة المرور القديمة مطلوبة",
        "any.required": "كلمة المرور القديمة مطلوبة",
    }),

    newPassword: Joi.string().min(6).max(100).required().messages({
        "string.empty": "كلمة المرور الجديدة مطلوبة",
        "string.min": "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
        "any.required": "كلمة المرور الجديدة مطلوبة",
    }),
});