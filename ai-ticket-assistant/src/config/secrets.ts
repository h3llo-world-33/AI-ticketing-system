import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: "us-east-1",
});

interface SecretValue {
  [key: string]: string;
}

export interface SecretsConfig {
  mongoUri?: string;
  jwtSecret?: string;
  smtpUser?: string;
  smtpPass?: string;
  geminiApiKey?: string;
  inngestEventKey?: string;
  inngestSigningKey?: string;
}

async function getSecret(secretName: string): Promise<SecretValue | null> {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });
    
    const response = await client.send(command);
    
    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }
    
    return null;
  } catch (error) {
    console.warn(`⚠️  Failed to fetch secret ${secretName}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function loadSecrets(): Promise<SecretsConfig> {
  console.log("🔐 Loading secrets from AWS Secrets Manager...");
  
  const secrets: SecretsConfig = {};
  
  try {
    // Load database secrets
    const dbSecret = await getSecret("ai-ticket/database");
    if (dbSecret?.MONGO_URI) {
      secrets.mongoUri = dbSecret.MONGO_URI;
      console.log("✅ Database secrets loaded");
    }
    
    // Load auth secrets
    const authSecret = await getSecret("ai-ticket/auth");
    if (authSecret?.JWT_SECRET) {
      secrets.jwtSecret = authSecret.JWT_SECRET;
      process.env.JWT_SECRET = authSecret.JWT_SECRET;  // ← ADD THIS LINE
      console.log("✅ Auth secrets loaded");
    }
    
    // Load email secrets
    const emailSecret = await getSecret("ai-ticket/email");
if (emailSecret?.SMTP_PASS) {
  secrets.smtpUser = emailSecret.SMTP_USER;  // ✅ Add this line
  secrets.smtpPass = emailSecret.SMTP_PASS;
  console.log("✅ Email secrets loaded");
}
    
    // Load AI service secrets
    const aiSecret = await getSecret("ai-ticket/ai-services");
    if (aiSecret?.GEMINI_API_KEY) {
      secrets.geminiApiKey = aiSecret.GEMINI_API_KEY;
      console.log("✅ AI service secrets loaded");
    }
    
    // Load Inngest secrets
    const inngestSecret = await getSecret("ai-ticket/inngest");
    if (inngestSecret?.INNGEST_EVENT_KEY) {
      secrets.inngestEventKey = inngestSecret.INNGEST_EVENT_KEY;
    }
    if (inngestSecret?.INNGEST_SIGNING_KEY) {
      secrets.inngestSigningKey = inngestSecret.INNGEST_SIGNING_KEY;
    }
    if (inngestSecret?.INNGEST_EVENT_KEY || inngestSecret?.INNGEST_SIGNING_KEY) {
      console.log("✅ Inngest secrets loaded");
    }
    
    console.log("🔐 Secrets loading completed");
    return secrets;
    
  } catch (error) {
    console.error("❌ Error loading secrets:", error);
    return {};
  }
}