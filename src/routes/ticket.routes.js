import { Router } from "express";
import { registerTicketRoutes } from "../controllers/ticket.controller.js";
const router = Router();
registerTicketRoutes(router);
export default router;
