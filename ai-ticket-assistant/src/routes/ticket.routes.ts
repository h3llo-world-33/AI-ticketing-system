// routes/ticket.routes.ts
import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { canAccessTicketByNumber } from "../middlewares/ticket.middleware";
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
  getTickets
);

export default router;
