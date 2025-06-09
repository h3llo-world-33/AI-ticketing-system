// routes/ticket.routes.ts
import express from "express";
import { UserRole } from "../constants/enums";
import { canAccessTicketByNumber } from "../middlewares/ticket.middleware";
import { requireUserRole, verifyToken } from "../middlewares/auth.middleware";
import { createTicket, getTicketByNumber, getTickets } from "../controllers/ticket.controller";

const router = express.Router();

router.post("/", verifyToken, createTicket);

router.get(
  "/:ticketNumber",
  verifyToken,
  canAccessTicketByNumber,
  getTicketByNumber
);

router.get(
  "/",
  verifyToken,
  requireUserRole(UserRole.ADMIN, UserRole.MODERATOR),
  getTickets
);

export default router;
