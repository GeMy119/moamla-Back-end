import Joi from "joi";


const moamla = {
    name: Joi.string().optional(),
    status: Joi.string().optional(),
    source_number: Joi.string().optional()

}
export const createWorkerSchema = Joi.object({
    employer_id: Joi.string().required().messages({
        "any.required": "الكفيل مطلوب",
    }),
    name: Joi.string().min(3).max(100).required().messages({
        "any.required": "الاسم مطلوب",
    }),
    identity_number: Joi.string().min(3).max(50).pattern(/^\d+$/).required().messages({
        "string.pattern.base": "رقم الهوية يجب أن يحتوي على أرقام فقط",
        "any.required": "رقم الهوية مطلوب",
    }),
    nationality: Joi.string().required().messages({
        "any.required": "الجنسية مطلوبة",
    }),
    profession: Joi.string().required().messages({
        "any.required": "المهنة مطلوبة",
    }),
    address: Joi.string().required().messages({
        "any.required": "العنوان مطلوب",
    }),
    account_number: Joi.string().required().messages({
        "any.required": "رقم الحساب البنكي مطلوب",
    }),
    iqama_number: Joi.string().required().messages({
        "any.required": "رقم الإقامة مطلوب",
    }),
    iqama_expiry_date: Joi.string().required().messages({
        "any.required": "تاريخ انتهاء الإقامة مطلوب",
    }),
    iqama_status: Joi.string().required().messages({
        "any.required": "حالة الإقامة مطلوبة",
    }),
    iqama_issue_date: Joi.string().required().messages({
        "any.required": "تاريخ إصدار الإقامة مطلوب",
    }),
    moamla_type: Joi.array().items(moamla).optional(),
    id: Joi.string().optional(), // من params لو موجود
});

export const updateWorkerSchema = Joi.object({
    employer_id: Joi.string().optional(),
    name: Joi.string().min(3).max(100).optional(),
    identity_number: Joi.string().min(3).max(50).pattern(/^\d+$/).optional(),
    nationality: Joi.string().optional(),
    profession: Joi.string().optional(),
    address: Joi.string().optional(),
    account_number: Joi.string().optional(),
    iqama_number: Joi.string().optional(),
    iqama_expiry_date: Joi.string().optional(),
    iqama_status: Joi.string().optional(),
    iqama_issue_date: Joi.string().optional(),
    id: Joi.string().optional(),
}).min(1).messages({
    "object.min": "يجب إرسال حقل واحد على الأقل للتحديث",
});

export const addAlertSchema = Joi.object({
    type: Joi.string().valid("الغاء بلاغ", "بلاغ تغيب").required().messages({
        "any.only": "نوع البلاغ يجب أن يكون 'الغاء بلاغ' أو 'بلاغ تغيب'",
        "any.required": "نوع البلاغ مطلوب",
    }),
    status: Joi.string().valid("rejected", "accepted").required().messages({
        "any.only": "حالة البلاغ يجب أن تكون 'rejected' أو 'accepted'",
        "any.required": "حالة البلاغ مطلوبة",
    }),
    filed_date: Joi.string().required().messages({
        "any.required": "تاريخ تقديم البلاغ مطلوب",
    }),
    resolved_date: Joi.string().optional().allow(null, ''),
    id: Joi.string().optional(),
    source_number: Joi.string().optional()

});

export const updateAlertSchema = Joi.object({
    type: Joi.string().valid("الغاء بلاغ", "بلاغ تغيب").optional(),
    status: Joi.string().valid("rejected", "accepted").optional(),
    filed_date: Joi.string().optional(),
    resolved_date: Joi.string().optional().allow(null, ''),
    id: Joi.string().optional(),
}).min(1);

export const addProfessionChangeSchema = Joi.object({
    status: Joi.string().valid("rejected", "accepted").optional(),
    change_date: Joi.string().required().messages({
        "any.required": "تاريخ تغيير المهنة مطلوب",
    }),
    new_profession: Joi.string().optional(),
    id: Joi.string().optional(),
    source_number: Joi.string().optional()

});

export const updateProfessionChangeSchema = Joi.object({
    status: Joi.string().valid("rejected", "accepted").optional(),
    change_date: Joi.string().optional(),
    new_profession: Joi.string().optional(),
    id: Joi.string().optional(),
}).min(1).messages({
    "object.min": "يجب إرسال حقل واحد على الأقل للتحديث",
});
export const moamlaTypeSchema = Joi.array().items(moamla);
