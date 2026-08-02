import { Router } from "express";

import {
    createVisit,
    getAllVisits,
    searchVisit,
    updateVisit,
    deleteVisit,
    searchVisitUser,
} from "./visit.controller.js";
import { createVisitSchema, updateVisitSchema } from "./visit.validaion.js";
import { protectedRoutes, allowTo } from "../../middleware/protectedRoute.js";
// import { uploadAndprocessFile } from "../../middleware/fileUpload.js";
import { validation } from "../../middleware/validation.js";
import uploadAndProcessForCloudinary from "../../middleware/uploadToCloudinaryMiddleware.js";

const visitRouter = Router();



// ── بحث (يوزر + أدمن) - لازم يجي قبل /:id ────────────
visitRouter.get("/search", protectedRoutes, searchVisit);
visitRouter.get("/searchVisit", searchVisitUser);

visitRouter.route("/")
    .get(protectedRoutes, allowTo("admin"), getAllVisits)
    // .post(
    //     protectedRoutes,
    //     allowTo("admin"),
    //     uploadAndprocessFile("visits", "image"),
    //     validation(createVisitSchema),
    //     createVisit
    // );
    .post(
        protectedRoutes,
        allowTo("admin"),
        uploadAndProcessForCloudinary('moamla/uploads/visits', 'image'),
        validation(createVisitSchema),
        createVisit
    );
visitRouter.route("/:id")
    .put(
        protectedRoutes,
        allowTo("admin"),
        uploadAndProcessForCloudinary('moamla/uploads/visits', 'image'),
        validation(updateVisitSchema),
        updateVisit
    )
    // .put(
    //     protectedRoutes,
    //     allowTo("admin"),
    //     uploadAndprocessFile("visits", "image"),
    //     validation(updateVisitSchema),
    //     updateVisit
    // )
    .delete(protectedRoutes, allowTo("admin"), deleteVisit);

export default visitRouter;