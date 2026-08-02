import mongoose from "mongoose";

const nationalityRequestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },  // سائق خاص
        application_number: { type: String, required: true }, //رقم المعامله
        issue_date: { type: String, required: true },
        serial_number: { type: String, required: true }, //الرقم التسلسلي للمعاملة
        status: { type: String, required: true, enum: ["تم الرفض", "تمت الموافقة"] },          // "تمت الموافقة"
        job: { type: String, required: true }, // المهنه,
        image_URL: { type: String, required: true }, // رابط الصورة
        identity_number: { type: String, required: true }, // رقم الهوية
        source_number: { type: String, required: true }, //  المعامله رقم 
        image_public_id: { type: String }
    },
    {
        timestamps: true
    }
)

nationalityRequestSchema.post('init', (doc) => {
    if (doc.image_URL && !doc.image_URL.startsWith('http')) {
        doc.image_URL = process.env.BASE_URL + '/nationality-requests/' + doc.image_URL;
    }
});
const NationalityRequest = mongoose.model("nationality_request", nationalityRequestSchema)
export default NationalityRequest 