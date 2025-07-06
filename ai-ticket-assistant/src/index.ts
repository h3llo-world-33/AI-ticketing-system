import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { serve } from "inngest/express";

import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import ticketRoutes from "./routes/ticket.routes";
import { inngest } from "./inngest/client";
import { onUserSignup } from "./inngest/functions/on-signup";
import { onTicketCreated } from "./inngest/functions/on-ticket-created";


dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: process.env.APP_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/inngest", serve({
  client: inngest,
  functions: [onUserSignup, onTicketCreated],
}));


connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ Database connection failed: ", err));
