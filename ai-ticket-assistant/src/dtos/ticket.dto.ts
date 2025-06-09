import { ITicket } from "../models/ticket.model";

export interface CreateTicketDTO {
  title: string;
  description: string;
}

export interface TicketResponseDTO {
  success: boolean;
  message: string;
  ticket?: ITicket;
}
