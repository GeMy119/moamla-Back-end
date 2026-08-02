import { Router } from "express";
import {
    createFamilyVisa,
    getAllFamilyVisas,
    getFamilyVisas,
    getFamilyVisaById,
    updateFamilyVisa,
    deleteFamilyVisa,
    getFamilyVisasUser,
} from "./familyVisas.controller.js";
import {
    createFamilyVisaSchema,
    updateFamilyVisaSchema,
} from "./familyVisas.validation.js";
import { protectedRoutes, allowTo } from "../../middleware/protectedRoute.js";
import { validation } from "../../middleware/validation.js";

const familyVisasRouter = Router();

// ── بحث عن تأشيرات عامل ──────────────────────────────
// أدمن: ?id=...                 يوزر: ?identity_number=&source_number=
// لازم تيجي قبل /:id عشان ما يتعارضوش
familyVisasRouter.get("/search", protectedRoutes, getFamilyVisas);
familyVisasRouter.get("/family-visas", getFamilyVisasUser);

familyVisasRouter.route("/")
    .get(protectedRoutes, allowTo("admin"), getAllFamilyVisas)
    .post(protectedRoutes, allowTo("admin"), validation(createFamilyVisaSchema), createFamilyVisa);

familyVisasRouter.route("/:id")
    .get(protectedRoutes, allowTo("admin"), getFamilyVisaById)
    .put(protectedRoutes, allowTo("admin"), validation(updateFamilyVisaSchema), updateFamilyVisa)
    .delete(protectedRoutes, allowTo("admin"), deleteFamilyVisa);

export default familyVisasRouter;