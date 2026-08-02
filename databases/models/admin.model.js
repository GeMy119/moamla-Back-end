import mongoose from "mongoose";
import bcrypt from "bcrypt";


const adminSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" }
},
    {
        timestamps: true
    }
)
adminSchema.pre("save", async function (next) {
    try {
        // Hash the password only if it has been modified or is new
        if (this.isModified("password") || this.isNew) {
            const hashedPassword = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUNDED));
            this.password = hashedPassword;
        }
        next();
    } catch (err) {
        next(err);
    }
});
const Admin = mongoose.model("admin", adminSchema)

export default Admin