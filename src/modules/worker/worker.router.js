import express from "express";

import {
    createWorker,
    getAllWorkers,
    getWorkerById,
    getWorkersByEmployer,
    updateWorker,
    deleteWorker,
    addAlert,
    updateAlert,
    deleteAlert,
    addProfessionChange,
    getProfessionChange,
    updateProfessionChange,
    deleteProfessionChange,
    getWorkersByEmployerAdmin,
    addMoamlaType,
    updateMoamlaType,
    deleteMoamlaType,
    getMoamlaTypeBySourceNumber,
    getAlert,
} from "./worker.controller.js";
import {
    createWorkerSchema,
    updateWorkerSchema,
    addAlertSchema,
    updateAlertSchema,
    addProfessionChangeSchema,
    updateProfessionChangeSchema,
} from "./worker.validation.js";
import { validation } from "../../middleware/validation.js";
import { allowTo, protectedRoutes } from "../../middleware/protectedRoute.js";

const workerRouter = express.Router();

// ── بحث عام بدون تسجيل دخول (الكفيل) ──
workerRouter.get("/alerts", getAlert);
workerRouter.get("/profession-changes", getProfessionChange);
workerRouter.get("/moamla-type", getMoamlaTypeBySourceNumber);

// ── عمليات الأدمن (محمية) ──
workerRouter.get("/employerAdmin/:employerId", protectedRoutes, allowTo("admin"), getWorkersByEmployerAdmin);
workerRouter.get("/employer", getWorkersByEmployer);

workerRouter
    .route("/")
    .post(protectedRoutes, validation(createWorkerSchema), createWorker)
    .get(protectedRoutes, getAllWorkers);

workerRouter
    .route("/:id")
    .get(protectedRoutes, getWorkerById)
    .put(protectedRoutes, validation(updateWorkerSchema), updateWorker)
    .delete(protectedRoutes, deleteWorker);

workerRouter
workerRouter
    .route("/:id/alerts")
    .post(protectedRoutes, validation(addAlertSchema), addAlert)
    .put(protectedRoutes, validation(updateAlertSchema), updateAlert)
    .delete(protectedRoutes, deleteAlert);
workerRouter
    .route("/:id/profession-changes")
    .post(protectedRoutes, validation(addProfessionChangeSchema), addProfessionChange)
    .put(protectedRoutes, validation(updateProfessionChangeSchema), updateProfessionChange)
    .delete(protectedRoutes, deleteProfessionChange);
workerRouter
    .route("/:id/moamla-type/:moamlaId")
    .put(protectedRoutes, updateMoamlaType)
    .delete(protectedRoutes, deleteMoamlaType);
workerRouter
    .route("/:id/moamla-type")
    .post(protectedRoutes, addMoamlaType)

export default workerRouter;