import mongoose, { Document, Schema, Types } from "mongoose";
import { TicketPriority, TicketStatus } from "../constants/enums";
import Counter from "./counter.model";

export interface ITicket extends Document {
  title: string;
  description: string;
  ticketNumber: number;
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
  ticketNumber: {
    type: Number,
    unique: true,
  },
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


ticketSchema.pre<ITicket>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "ticket" },            // Look for the counter named "ticket"
      { $inc: { seq: 1 } },          // Atomically increment `seq` field by 1
      { new: true, upsert: true }    // Return updated doc, create if not found
    );
    this.ticketNumber = counter.seq;
  }
  next();
});


const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
export default Ticket;
