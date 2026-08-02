import Joi from "joi";

export const createNationalityRequestSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "string.empty": "الاسم مطلوب",
        "string.min": "الاسم يجب أن يكون 3 أحرف على الأقل",
        "any.required": "الاسم مطلوب",
    }),

    application_number: Joi.string().min(3).max(50).required().messages({
        "string.empty": "رقم المعاملة مطلوب",
        "any.required": "رقم المعاملة مطلوب",
    }),

    issue_date: Joi.string().required().messages({
        "any.required": "تاريخ الإصدار مطلوب",
    }),

    serial_number: Joi.string().min(3).max(50).required().messages({
        "string.empty": "الرقم التسلسلي مطلوب",
        "any.required": "الرقم التسلسلي مطلوب",
    }),

    status: Joi.string()
        .valid("تم الرفض", "تمت الموافقة")
        .required()
        .messages({
            "any.only": "الحالة يجب أن تكون 'تم الرفض' أو 'تمت الموافقة'",
            "any.required": "الحالة مطلوبة",
        }),

    job: Joi.string().min(2).max(100).required().messages({
        "string.empty": "المهنة مطلوبة",
        "any.required": "المهنة مطلوبة",
    }),

    // image_URL هتتولد من رفع الملف نفسه في الكنترولر مش من اليوزر
    image_URL: Joi.forbidden().messages({
        "any.unknown": "رابط الصورة يُحدَّد تلقائياً من الملف المرفوع",
    }),
    identity_number: Joi.string().min(3).max(50).pattern(/^\d+$/).required().messages({
        "string.empty": "رقم الهوية مطلوب",
        "string.pattern.base": "رقم الهوية يجب أن يحتوي على أرقام فقط",
        "any.required": "رقم الهوية مطلوب",
    }),

    source_number: Joi.string().min(3).max(50).optional(),
    image_public_id: Joi.string().optional(),
});

export const updateNationalityRequestSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    application_number: Joi.string().min(3).max(50),
    issue_date: Joi.string(),
    serial_number: Joi.string().min(3).max(50),
    status: Joi.string().valid("تم الرفض", "تمت الموافقة"),
    job: Joi.string().min(2).max(100),
    image_URL: Joi.forbidden().messages({
        "any.unknown": "رابط الصورة يُحدَّد تلقائياً من الملف المرفوع",
    }),
    identity_number: Joi.string().min(3).max(50).pattern(/^\d+$/),
    source_number: Joi.string().min(3).max(50),
    image_public_id: Joi.string().optional()

}).min(1).messages({
    "object.min": "يجب إرسال حقل واحد على الأقل للتحديث",
});
