import mongoose, { Schema, Types } from "mongoose";
import { TicketPriority, TicketStatus } from "../constants/enums";

export interface ITicket extends Document {
  title: string;
  description: string;
  status?: TicketStatus;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  priority?: TicketPriority;
  deadline?: Date;
  helpfulNotes?: string;
  relatedSkills?: string[];
  createdAt?: Date;
}

const ticketSchema = new Schema<ITicket>({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: Object.values(TicketStatus),
    default: TicketStatus.TODO,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  priority: {
    type: String,
    enum: Object.values(TicketPriority),
  },
  deadline: { type: Date },
  helpfulNotes: { type: String },
  relatedSkills: [{ type: String }],

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Ticket", ticketSchema);
