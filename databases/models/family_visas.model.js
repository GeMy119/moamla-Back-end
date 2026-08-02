import mongoose from "mongoose";

const familyVisasSchema = new mongoose.Schema(
    {

        worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },    // workers
        visitor_name: { type: String, required: true },
        relation: { type: String, required: true },        // أخت الزوجة / أم الزوجة
        nationality: { type: String, required: true },
        purpose: { type: String, required: true, enum: ["familyVisit", "familyRecruitment"] },         // زيارة عائلية او استقدام
        duration_days: { type: Number, required: true },   // 90 يوم
        validity_days: { type: Number },   // 365
        arrival_from: { type: String },    // أبوظبي
        status: { type: String, enum: ["pending", "approved", "rejected"] },// الحاله
        releaseDate: { type: String, required: true }, // تاريخ الإصدار
        source_number: { type: String },
        age: { type: Number, required: true }


    },
    {
        timestamps: true
    }
)
const FamilyVisas = mongoose.model("family_visas", familyVisasSchema)
export default FamilyVisas 