import { Router } from "express";
import {
    createNationalityRequest,
    getAllNationalityRequests,
    getNationalityRequestById,
    searchNationalityRequest,
    updateNationalityRequest,
    deleteNationalityRequest,
} from "./nationalityRequest.controller.js";
import {
    createNationalityRequestSchema,
    updateNationalityRequestSchema,
} from "./nationalityRequest.validation.js";
import { validation } from "../../middleware/validation.js";
// import { uploadAndprocessFile } from "../../middleware/fileUpload.js";
import { protectedRoutes, allowTo } from "../../middleware/protectedRoute.js";
import uploadAndProcessForCloudinary from "../../middleware/uploadToCloudinaryMiddleware.js";

const nationalityRequestsRouter = Router();

nationalityRequestsRouter.get("/search", searchNationalityRequest);

nationalityRequestsRouter.route("/")
    .get(protectedRoutes, allowTo("admin"), getAllNationalityRequests)
    // .post(
    //     protectedRoutes,
    //     allowTo("admin"),
    //     uploadAndprocessFile("nationality-requests", "image"),
    //     validation(createNationalityRequestSchema),
    //     createNationalityRequest
    // )
    .post(
        protectedRoutes,
        allowTo("admin"),
        uploadAndProcessForCloudinary('moamla/uploads/nationality-requests', 'image'),
        validation(createNationalityRequestSchema),
        createNationalityRequest
    );

nationalityRequestsRouter.route("/:id")
    .get(protectedRoutes, allowTo("admin"), getNationalityRequestById)
    .put(
        protectedRoutes,
        allowTo("admin"),
        uploadAndProcessForCloudinary('moamla/uploads/nationality-requests', 'image'),
        validation(updateNationalityRequestSchema),
        updateNationalityRequest
    )
    // .put(
    //     protectedRoutes,
    //     allowTo("admin"),
    //     uploadAndprocessFile("nationality-requests", "image"),
    //     validation(updateNationalityRequestSchema),
    //     updateNationalityRequest
    // )
    .delete(protectedRoutes, allowTo("admin"), deleteNationalityRequest);

export default nationalityRequestsRouter;