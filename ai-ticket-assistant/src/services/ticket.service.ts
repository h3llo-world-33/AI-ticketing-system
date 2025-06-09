import Ticket from "../models/ticket.model";
import { CreateTicketDTO } from "../dtos/ticket.dto";
import { inngest } from "../inngest/client";


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


export const getAllTickets = async () => {
  const tickets = await Ticket.find({})
    .sort({ createdAt: -1 })
    .lean();

  return tickets;
};


export const getTicketByTicketNumber = async (ticketNumber: number) => {
  const ticket = await Ticket.findOne({ ticketNumber });

  if (!ticket) {
    throw new Error(`#TICKET-${ticketNumber} not found`);
  }

  return ticket;
};
