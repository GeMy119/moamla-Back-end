import { name } from "ejs";
import Joi from "joi";

const ticketVisaReview = {
    nationality: Joi.string().optional(),
    profession: Joi.string().optional(),
    arrival_port: Joi.string().optional(),
    count: Joi.number().optional()
}

export const createEmployerSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        "string.empty": "الاسم مطلوب",
        "string.min": "الاسم يجب أن يكون 3 أحرف على الأقل",
        "any.required": "الاسم مطلوب",
    }),

    identity_number: Joi.string().min(3).max(50).pattern(/^\d+$/).required().messages({
        "string.empty": "رقم الهوية مطلوب",
        "string.pattern.base": "رقم الهوية يجب أن يحتوي على أرقام فقط",
        "any.required": "رقم الهوية مطلوب",
    }),

    source_number: Joi.string().min(3).max(50).optional(),
    address: Joi.string().min(5).max(200).required().messages({
        "string.empty": "العنوان مطلوب",
        "any.required": "العنوان مطلوب",
    }),
    file_number: Joi.string().min(3).max(50).required().messages({
        "string.empty": "رقم الملف مطلوب",
        "any.required": "رقم الملف مطلوب",
    }),
    reference_number: Joi.string().min(3).max(50).required().messages({
        "string.empty": "رقم المرجع مطلوب",
        "any.required": "رقم المرجع مطلوب",
    }),
    company_name: Joi.string().min(3).max(100).required().messages({
        "string.empty": "اسم الشركة مطلوب",
        "any.required": "اسم الشركة مطلوب",
    }),
    marriage_permit: Joi.object().optional(),
    ticket_visa_review: Joi.array().items(ticketVisaReview).optional(),
});

export const updateEmployerSchema = Joi.object({
    id: Joi.string(),
    name: Joi.string().min(3).max(100).messages({
        "string.min": "الاسم يجب أن يكون 3 أحرف على الأقل",
    }),

    identity_number: Joi.string().length(10).pattern(/^\d+$/).messages({
        "string.length": "رقم الهوية يجب أن يكون 10 أرقام",
        "string.pattern.base": "رقم الهوية يجب أن يحتوي على أرقام فقط",
    }),

    source_number: Joi.string().min(3).max(50),

    address: Joi.string().min(5).max(200).messages({
        "string.min": "العنوان يجب أن يكون 5 أحرف على الأقل",
    }),
    company_name: Joi.string().min(3).max(100).messages({
        "string.min": "اسم الشركة يجب أن يكون 3 أحرف على الأقل",
    }),
    file_number: Joi.string().min(3).max(50).messages({
        "string.min": "رقم الملف يجب أن يكون 3 أحرف على الأقل",
    }),
    reference_number: Joi.string().min(3).max(50).messages({
        "string.min": "رقم الملف يجب أن يكون 3 أحرف على الأقل",
    }),
}).min(1).messages({
    "object.min": "يجب إرسال حقل واحد على الأقل للتحديث",
});
export const marriagePermitSchema = Joi.object({
    id: Joi.string().required().messages({
        "any.required": "معرف صاحب العمل مطلوب",
    }),
    status: Joi.string().valid("accepted", "cancled").required().messages({
        "any.only": "حالة تصريح الزواج يجب أن تكون 'accepted' أو 'cancled'",
        "any.required": "حالة تصريح الزواج مطلوبة",
    }),
    issue_date: Joi.string().required().messages({
        "any.required": "تاريخ إصدار تصريح الزواج مطلوب",
    }),
    sending_date: Joi.string().optional(),
    wife_nationality: Joi.string().required().messages({
        "any.required": "جنسية الزوجة مطلوبة",
    }),
    arrival_port: Joi.string().required().messages({
        "any.required": "مكان القدوم مطلوب",
    }),
    ProfessionCategory: Joi.string().required(),
    lastSearchedAt: Joi.optional(),
    file_number: Joi.string().optional().allow('', null),
    name: Joi.string().optional().allow('', null),
    source_number: Joi.string().optional()
});
export const ticketVisaReviewSchema = Joi.array().items(ticketVisaReview);

