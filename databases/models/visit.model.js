import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
    {
        visaNo: { type: String, required: true, unique: true }, // رقم التأشيره
        passportNo: { type: String, required: true, unique: true }, // رقم جواز السفر
        code: { type: String, required: true, unique: true }, //رقم السجل   
        applicationNo: { type: String, required: true, unique: true }, // رقم الطلب
        name: { type: String, required: true },
        birthDate: { type: String, required: true }, // تاريخ الميلاد
        validFrom: { type: String, required: true }, // صالحه اعتبارا من 
        validUntil: { type: String, required: true }, // صالحه لغايه
        image_url: { type: String, required: true },
        typeOfVisa: { type: String, required: true }, // نوع التأشيره
        durationOfStay: { type: String, required: true }, // مده الاقامه
        nationality: { type: String, required: true }, // الجنسيه  
        placeOfIssue: { type: String, required: true }, // مصدر التأشيره
        entryType: { type: String, required: true }, // عدد مرات الدخول
        source_number: { type: String, required: true }, // رقم الصادر
        lastSearchedAt: { type: Date, default: null },
        image_public_id: { type: String }
    },
    {
        timestamps: true
    }
)

visitSchema.post('init', (doc) => {
    if (doc.image_url && !doc.image_url.startsWith('http')) {
        doc.image_url = process.env.BASE_URL + '/visits/' + doc.image_url;
    }
});
const Visit = mongoose.model("visit", visitSchema)
export default Visit 