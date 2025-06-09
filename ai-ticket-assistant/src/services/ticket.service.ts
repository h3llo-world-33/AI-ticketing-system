import Ticket, { ITicket } from "../models/ticket.model";
import { CreateTicketDTO } from "../dtos/ticket.dto";
import { inngest } from "../inngest/client";
import { UserRole } from "../constants/enums";


export const createTicket = async (userId: string, data: CreateTicketDTO) => {

  // Create the ticket
  const newTicket = await Ticket.create({
    title: data.title,
    description: data.description,
    createdBy: userId,
  });

  if (!newTicket) {
    throw new Error("Ticket creation failed");
  }

  // Send event to Inngest for background processing
  await inngest.send({
    name: "ticket/created",
    data: {
      ticketId: newTicket._id?.toString(),
      ticketNumber: newTicket.ticketNumber,
      title: newTicket.title,
      description: newTicket.description,
      createdBy: newTicket.createdBy.toString(),
    },
  });

  return newTicket;
};


export const getAllTickets = async (userId: string, role: UserRole) => {
  let tickets: ITicket[] = [];

  if (role !== UserRole.USER) {
    tickets = await Ticket.find()
      .populate("assignedTo", ["name", "email", "_id"])
      .sort({ createdAt: -1 });

  } else {
    tickets = await Ticket.find({ createdBy: userId })
      .select("title description status createdAt")
      .sort({ createdAt: -1 });
  }

  return tickets;
};


export const getTicketByTicketNumber = async (userId: string, role: UserRole, ticketNumber: number) => {
  let ticket: ITicket | null;

  if (role !== UserRole.USER) {
    ticket = await Ticket.findOne({ ticketNumber })
      .populate("assignedTo", ["name", "email", "_id"]);
  } else {
    ticket = await Ticket.findOne({ ticketNumber, createdBy: userId })
      .select("title description ticketNumber status createdAt")
  }

  if (!ticket) {
    throw new Error(`#TICKET-${ticketNumber} not found`);
  }

  return ticket;
};
