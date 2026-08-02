import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
    {
        employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },   // ref → employers
        name: { type: String, required: true },           // معن أحمد ابن علي الغامدي
        identity_number: { type: String, required: true }, // رقم الهوية 1234567890
        source_number: { type: String, required: true },    // رقم الصادر 2521793616
        nationality: { type: String, required: true },     // باكستان / بنجلاديش
        profession: { type: String, required: true },        // عامل تحميل وتنزيل
        address: { type: String, required: true },// العنوان
        account_number: { type: String, required: true },// رقم الحساب البنكي
        iqama_number: { type: String, required: true }, // رقم الإقامة 1234567890
        iqama_expiry_date: { type: String, required: true }, // تاريخ انتهاء الإقامة 2023-12-31
        iqama_status: { type: String, required: true }, // حالة الإقامة
        iqama_issue_date: { type: String, required: true }, // تاريخ إصدار الإقامة 2023-01-01
        alerts:
        {
            type: { type: String, enum: ["الغاء بلاغ", "بلاغ تغيب"] },
            status: { type: String, enum: ["rejected", "accepted"] },
            filed_date: { type: String },
            resolved_date: { type: String },
            source_number: { type: String }
        }
        ,
        profession_changes:
        {
            old_profession: { type: String },
            status: { type: String, enum: ["rejected", "accepted"] },
            change_date: { type: String },
            source_number: { type: String }

        },
        moamla_type: [
            {
                name: { type: String },
                status: { type: String, enum: ["rejected", "accepted"] },
                source_number: { type: String }

            }
        ]

    },

    {
        timestamps: true
    }
)

// 1. عند الحذف عن طريق المستند (Document): worker.deleteOne()
workerSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const FamilyVisas = mongoose.model('family_visas');
        await FamilyVisas.deleteMany({ worker_id: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

// 2. عند الحذف عن طريق الاستعلام (Query): Worker.findByIdAndDelete(id) أو Worker.deleteOne({ _id })
workerSchema.pre('findOneAndDelete', async function (next) {
    try {
        const docToDelete = await this.model.findOne(this.getQuery());
        if (docToDelete) {
            const FamilyVisas = mongoose.model('family_visas');
            await FamilyVisas.deleteMany({ worker_id: docToDelete._id });
        }
        next();
    } catch (error) {
        next(error);
    }
});
const Worker = mongoose.model("Worker", workerSchema)
export default Worker 