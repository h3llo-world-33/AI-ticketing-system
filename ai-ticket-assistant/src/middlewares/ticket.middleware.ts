import { Request, Response, NextFunction } from "express";
import Ticket from "../models/ticket.model";
import { UserRole } from "../constants/enums";


export const canAccessTicketByNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: No valid access",
      });
      return;
    }

    const ticketNumber = parseInt(req.params.ticketNumber);

    if (isNaN(ticketNumber)) {
      res.status(400).json({
        success: false,
        message: "Invalid ticket number"
      });
      return;
    }

    const ticket = await Ticket.findOne({ ticketNumber });
    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    // Allow access if: admin, moderator, or owner of the ticket
    if (
      user.role === UserRole.ADMIN ||
      user.role === UserRole.MODERATOR ||
      ticket.createdBy.toString() === user.id
    ) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: "Forbidden: You don't have access to this ticket",
    });

  } catch (error) {
    console.error("Access check failed", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking access",
    });
  }
};
