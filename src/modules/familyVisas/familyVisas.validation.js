import Joi from "joi";

export const createFamilyVisaSchema = Joi.object({
    worker_id: Joi.string().hex().length(24).required().messages({
        "string.hex": "worker_id غير صحيح",
        "string.length": "worker_id غير صحيح",
        "any.required": "الكفيل (worker_id) مطلوب",
    }),

    visitor_name: Joi.string().min(3).max(100).required().messages({
        "string.empty": "اسم الزائر مطلوب",
        "string.min": "اسم الزائر يجب أن يكون 3 أحرف على الأقل",
        "any.required": "اسم الزائر مطلوب",
    }),

    relation: Joi.string().min(2).max(50).required().messages({
        "string.empty": "صلة القرابة مطلوبة",
        "any.required": "صلة القرابة مطلوبة",
    }),

    nationality: Joi.string().min(2).max(50).required().messages({
        "string.empty": "الجنسية مطلوبة",
        "any.required": "الجنسية مطلوبة",
    }),

    purpose: Joi.string()
        .valid("familyVisit", "familyRecruitment")
        .required()
        .messages({
            "any.only": "الغرض يجب أن يكون 'familyVisit' أو 'familyRecruitment'",
            "any.required": "الغرض مطلوب",
        }),

    duration_days: Joi.number().integer().min(1).max(365).required().messages({
        "number.base": "مدة الإقامة يجب أن تكون رقم",
        "number.min": "مدة الإقامة يجب أن تكون يوم واحد على الأقل",
        "any.required": "مدة الإقامة مطلوبة",
    }),

    validity_days: Joi.number().integer().min(1).max(365).messages({
        "number.base": "مدة الصلاحية يجب أن تكون رقم",
        "number.min": "مدة الصلاحية يجب أن تكون يوم واحد على الأقل",
    }),

    arrival_from: Joi.string().min(2).max(100).messages({
        "string.min": "مكان القدوم يجب أن يكون حرفين على الأقل",
    }),

    status: Joi.string().min(2).max(50).valid("pending", "approved", "rejected").messages({
        "any.only": "الحالة يجب أن تكون 'pending' أو 'approved' أو 'rejected'",
    }),

    releaseDate: Joi.string().required().messages({
        "any.required": "تاريخ الإصدار مطلوب",
    }),
    source_number: Joi.string().min(3).max(50).optional(),
    age: Joi.number().required()

});

export const updateFamilyVisaSchema = Joi.object({
    worker_id: Joi.string().hex().length(24).messages({
        "string.hex": "worker_id غير صحيح",
        "string.length": "worker_id غير صحيح",
    }),

    visitor_name: Joi.string().min(3).max(100),

    relation: Joi.string().min(2).max(50),

    nationality: Joi.string().min(2).max(50),

    purpose: Joi.string()
        .valid("familyVisit", "familyRecruitment")
        .messages({ "any.only": "الغرض يجب أن يكون 'familyVisit' أو 'familyRecruitment'" }),

    duration_days: Joi.number().integer().min(1).max(365),

    validity_days: Joi.number().integer().min(1).max(365),

    arrival_from: Joi.string().min(2).max(100),

    status: Joi.string().min(2).max(50),

    releaseDate: Joi.string()
}).min(1).messages({
    "object.min": "يجب إرسال حقل واحد على الأقل للتحديث",
});