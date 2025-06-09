// src/controllers/ticket.controller.ts
import { Request, Response } from "express";
import * as ticketService from "../services/ticket.service";
import { CreateTicketDTO, TicketResponseDTO } from "../dtos/ticket.dto";

export const createTicket = async (
  req: Request<{}, {}, CreateTicketDTO>,
  res: Response<TicketResponseDTO>
) => {
  try {
    const { user } = req;
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Access denied"
      });
      return;
    }

    const { title, description } = req.body;
    // Validate required fields
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const ticket = await ticketService.createTicket(user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Ticket created successfully & processing started...",
      ticket
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create ticket"
    });
  }
};


export const getTickets = async (req: Request, res: Response) => {
  try {
    const { user } = req;
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Access denied"
      });
      return;
    }

    const tickets = await ticketService.getAllTickets(user.id, user.role);

    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve tickets"
    });
  }
};


export const getTicketByNumber = async (req: Request, res: Response<TicketResponseDTO>) => {
  try {
    const { user } = req;
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Access denied"
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

    const ticket = await ticketService.getTicketByTicketNumber(user.id, user.role, ticketNumber);

    res.status(200).json({
      success: true,
      message: `Fetched the ticket: #TICKET-${ticket.ticketNumber}`,
      ticket
    });

  } catch (error: any) {
    if (error.message.includes("not found")) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve ticket"
    });
  }
};
