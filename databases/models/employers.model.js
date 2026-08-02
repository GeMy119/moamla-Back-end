import mongoose from "mongoose";


const employersSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },           // معن أحمد ابن علي الغامدي
        identity_number: { type: String, required: true }, // رقم الهوية
        source_number: { type: String, required: true },     // رقم الصادر
        address: { type: String, required: true },// العنوان
        file_number: { type: String, required: true },     // رقم الملف 1234567890
        company_name: { type: String, required: true },    // مؤسسة معن أحمد...
        reference_number: { type: String, required: true }, // رقم المرجع
        // تصريح الزواج
        marriage_permit: {
            status: { type: String, enum: ["accepted", "cancled"] },        // "تمت الموافقة" | "تم الإلغاء"
            issue_date: { type: String }, // تاريخ الإصدار
            sending_date: { type: String },// تاريخ الإرسال
            wife_nationality: { type: String },// جنسية الزوجة
            type: { type: String, default: "تصريح زواج" }, // نوع التصريحً
            arrival_port: { type: String },    // مكان القدوم
            ProfessionCategory: { type: String }, // فئة المهنة
            file_number: { type: String },     // رقم الملف 1234567890
            lastSearchedAt: { type: Date },
            name: { type: String },
            source_number: { type: String }
        },
        ticket_visa_review:
            [
                {
                    nationality: { type: String }, // جنسية العامل
                    profession: { type: String }, // مهنة العامل
                    count: { type: Number }, // عدد العمال
                    arrival_port: { type: String }, // مكان القدوم
                }

            ]
    },

    {
        timestamps: true
    }
)

employersSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    // استدعاء موديل Worker
    const Worker = mongoose.model('Worker');

    // حذف جميع العمال التابعين لهذا المستند
    await Worker.deleteMany({ employer_id: this._id });

    next();
});
const Employer = mongoose.model("Employer", employersSchema)
export default Employer 