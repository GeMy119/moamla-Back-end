import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { addMarriagePermit, addTicketVisaReview, createEmployer, deleteEmployer, deleteTicketVisaReview, getAllEmployers, getEmployerById, getMarriagePermit, getTicketVisaReview, updateEmployer, updateMarriagePermit, updateTicketVisaReview } from "./employer.controller.js";
import { createEmployerSchema, marriagePermitSchema, ticketVisaReviewSchema, updateEmployerSchema } from "./employer.validation.js";
import { protectedRoutes } from "../../middleware/protectedRoute.js";
const employerRouter = Router();

employerRouter.route("/marriage-permit")
    .get(getMarriagePermit);
employerRouter.route("/")
    .get(getAllEmployers)
    .post(validation(createEmployerSchema), createEmployer);
employerRouter.route("/:id")
    .get(getEmployerById)
    .put(validation(updateEmployerSchema), updateEmployer)
    .delete(deleteEmployer);
employerRouter.route("/:id/marriage-permit")
    .post(validation(marriagePermitSchema), addMarriagePermit)
    .put(updateMarriagePermit);
employerRouter.route("/:id/ticket-visa-review")
    .post(protectedRoutes, addTicketVisaReview)
employerRouter.route("/:id/ticket-visa-review/:reviewId")
    .put(protectedRoutes, updateTicketVisaReview)
    .delete(protectedRoutes, deleteTicketVisaReview);
employerRouter.route("/ticket-visa-review")
    .get(protectedRoutes, getTicketVisaReview);

export default employerRouter;