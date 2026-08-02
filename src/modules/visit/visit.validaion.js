import Joi from "joi";

export const createVisitSchema = Joi.object({
    visaNo: Joi.string().min(3).max(50).required().messages({
        "string.empty": "رقم التأشيرة مطلوب",
        "any.required": "رقم التأشيرة مطلوب",
    }),
    source_number: Joi.string().min(3).max(50).optional(),

    passportNo: Joi.string().min(3).max(50).required().messages({
        "string.empty": "رقم جواز السفر مطلوب",
        "any.required": "رقم جواز السفر مطلوب",
    }),

    code: Joi.string().min(2).max(50).required().messages({
        "string.empty": "رقم السجل مطلوب",
        "any.required": "رقم السجل مطلوب",
    }),

    applicationNo: Joi.string().min(2).max(50).required().messages({
        "string.empty": "رقم الطلب مطلوب",
        "any.required": "رقم الطلب مطلوب",
    }),

    name: Joi.string().min(3).max(100).required().messages({
        "string.empty": "الاسم مطلوب",
        "string.min": "الاسم يجب أن يكون 3 أحرف على الأقل",
        "any.required": "الاسم مطلوب",
    }),

    birthDate: Joi.string().required().messages({
        "any.required": "تاريخ الميلاد مطلوب",
    }),

    validFrom: Joi.string().required().messages({
        "any.required": "تاريخ الصلاحية (من) مطلوب",
    }),

    validUntil: Joi.string().required().messages({
        "any.required": "تاريخ الصلاحية (إلى) مطلوب",
    }),

    typeOfVisa: Joi.string().min(2).max(50).required().messages({
        "string.empty": "نوع التأشيرة مطلوب",
        "any.required": "نوع التأشيرة مطلوب",
    }),

    durationOfStay: Joi.string().min(1).max(50).required().messages({
        "string.empty": "مدة الإقامة مطلوبة",
        "any.required": "مدة الإقامة مطلوبة",
    }),

    nationality: Joi.string().min(2).max(50).required().messages({
        "string.empty": "الجنسية مطلوبة",
        "any.required": "الجنسية مطلوبة",
    }),

    placeOfIssue: Joi.string().min(2).max(100).required().messages({
        "string.empty": "مصدر التأشيرة مطلوب",
        "any.required": "مصدر التأشيرة مطلوب",
    }),

    entryType: Joi.string().min(2).max(50).required().messages({
        "string.empty": "عدد مرات الدخول مطلوب",
        "any.required": "عدد مرات الدخول مطلوب",
    }),

    // image_url بتتولد من رفع الملف في الكنترولر مش من اليوزر
    image_url: Joi.forbidden().messages({
        "any.unknown": "رابط الصورة يُحدَّد تلقائياً من الملف المرفوع",
    }),
    lastSearchedAt: Joi.date().optional().allow(null),
    image_public_id: Joi.string().optional()
});

export const updateVisitSchema = Joi.object({
    visaNo: Joi.string().min(3).max(50),
    passportNo: Joi.string().min(3).max(50),
    code: Joi.string().min(2).max(50),
    applicationNo: Joi.string().min(2).max(50),
    name: Joi.string().min(3).max(100),
    birthDate: Joi.string(),
    validFrom: Joi.string(),
    validUntil: Joi.string(),
    typeOfVisa: Joi.string().min(2).max(50),
    durationOfStay: Joi.string().min(1).max(50),
    nationality: Joi.string().min(2).max(50),
    placeOfIssue: Joi.string().min(2).max(100),
    entryType: Joi.string().min(2).max(50),
    image_url: Joi.object().required().unknown(), // يقبل الـ Multer File Object
    lastSearchedAt: Joi.date().optional().allow(null),
    image_public_id: Joi.string().optional()
}).min(1).messages({
    "object.min": "يجب إرسال حقل واحد على الأقل للتحديث",
});