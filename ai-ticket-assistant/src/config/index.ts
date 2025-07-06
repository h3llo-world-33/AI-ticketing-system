import { SecretsConfig } from "./secrets";

export interface Config {
  database: {
    mongoUri: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
  auth: {
    jwtSecret: string;
  };
  ai: {
    geminiApiKey: string;
  };
  inngest: {
    eventKey: string;
    signingKey: string;
  };
  app: {
    port: number;
    url: string;
    nodeEnv: string;
  };
}

let config: Config;

export function createConfig(secrets: SecretsConfig = {}): Config {
  // Create configuration with secrets fallback to environment variables
  config = {
    database: {
      mongoUri: secrets.mongoUri || process.env.MONGO_URI || "",
    },
    email: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || "devop.helloworld@gmail.com",
      pass: secrets.smtpPass || process.env.SMTP_PASS || "",
    },
    auth: {
      jwtSecret: secrets.jwtSecret || process.env.JWT_SECRET || "",
    },
    ai: {
      geminiApiKey: secrets.geminiApiKey || process.env.GEMINI_API_KEY || "",
    },
    inngest: {
      eventKey: secrets.inngestEventKey || process.env.INNGEST_EVENT_KEY || "",
      signingKey: secrets.inngestSigningKey || process.env.INNGEST_SIGNING_KEY || "",
    },
    app: {
      port: Number(process.env.PORT) || 5000,
      url: process.env.APP_URL || "http://localhost:3000",
      nodeEnv: process.env.NODE_ENV || "development",
    },
  };

  // Validate required configuration
  validateConfig(config);
  
  return config;
}

function validateConfig(config: Config): void {
  const required = [
    { key: "database.mongoUri", value: config.database.mongoUri },
    { key: "auth.jwtSecret", value: config.auth.jwtSecret },
    { key: "email.user", value: config.email.user },
    { key: "email.pass", value: config.email.pass },
  ];

  const missing = required.filter(({ value }) => !value);
  
  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key).join(", ");
    throw new Error(`❌ Missing required configuration: ${missingKeys}`);
  }
}

export function getConfig(): Config {
  if (!config) {
    throw new Error("Configuration not initialized. Call createConfig() first.");
  }
  return config;
}

// Export individual config getters for convenience
export const getDbConfig = () => getConfig().database;
export const getEmailConfig = () => getConfig().email;
export const getAuthConfig = () => getConfig().auth;
export const getAiConfig = () => getConfig().ai;
export const getInngestConfig = () => getConfig().inngest;
export const getAppConfig = () => getConfig().app;