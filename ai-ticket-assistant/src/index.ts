import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { serve } from "inngest/express";
import { connectDB } from "./config/db";
import { loadSecrets } from "./config/secrets";
import { createConfig, getAppConfig } from "./config";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import ticketRoutes from "./routes/ticket.routes";
import { inngest } from "./inngest/client";
import { onUserSignup } from "./inngest/functions/on-signup";
import { onTicketCreated } from "./inngest/functions/on-ticket-created";

async function startServer() {
  try {
    // Load environment variables first
    dotenv.config();
    
    // Load secrets from AWS Secrets Manager (with fallback to env vars)
    const secrets = await loadSecrets();
    
    // Initialize configuration
    const config = createConfig(secrets);
    const appConfig = getAppConfig();
    
    const app = express();
    
    app.use(cors({
      origin: appConfig.url,
      credentials: true,
    }));
    
    app.use(express.json());
    app.use(cookieParser());
    
    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "healthy", timestamp: new Date().toISOString() });
    });
    
    // Register all routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/tickets", ticketRoutes);
    
    app.use("/api/inngest", serve({
      client: inngest,
      functions: [onUserSignup, onTicketCreated],
    }));
    
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(appConfig.port, () => {
      console.log(`🚀 Server running on http://localhost:${appConfig.port}`);
      console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();