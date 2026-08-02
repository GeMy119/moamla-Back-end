import { Router } from "express";
import {
    registerAdmin,
    loginAdmin,
    getMe,
    changePassword,
} from "./admin.controller.js";
import {
    registerAdminSchema,
    loginAdminSchema,
    changePasswordSchema,
} from "./admin.validation.js";
import { protectedRoutes, allowTo } from "../../middleware/protectedRoute.js";
import { validation } from "../../middleware/validation.js";

const adminRouter = Router();



// تسجيل أدمن جديد - يفضل تحميه إنت بنفسك (مثلاً يتقفل بعد أول إنشاء)
adminRouter.post("/register", validation(registerAdminSchema), registerAdmin);

adminRouter.post("/login", validation(loginAdminSchema), loginAdmin);

adminRouter.get("/me", protectedRoutes, allowTo("admin"), getMe);

adminRouter.put(
    "/change-password",
    protectedRoutes,
    allowTo("admin"),
    validation(changePasswordSchema),
    changePassword
);

export default adminRouter;