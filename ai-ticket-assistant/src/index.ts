import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { serve } from "inngest/express";
import { connectDB } from "./config/db";
import { loadSecrets } from "./config/secrets";
import { createConfig, getAppConfig } from "./config";

// Load environment variables first
dotenv.config();

// Initialize everything in an async IIFE
(async () => {
  try {
    // Load secrets and initialize config first
    const secrets = await loadSecrets();
    createConfig(secrets);

    // Now dynamically import modules that depend on config
    const [
      { default: authRoutes },
      { default: userRoutes },
      { default: ticketRoutes },
      { inngest },
      { onUserSignup },
      { onTicketCreated }
    ] = await Promise.all([
      import("./routes/auth.routes"),
      import("./routes/user.routes"),
      import("./routes/ticket.routes"),
      import("./inngest/client"),
      import("./inngest/functions/on-signup"),
      import("./inngest/functions/on-ticket-created")
    ]);

    const appConfig = getAppConfig();
    const app = express();

    app.use(cors({
      origin: true,
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
      console.log("✅ Configuration initialized successfully");
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();