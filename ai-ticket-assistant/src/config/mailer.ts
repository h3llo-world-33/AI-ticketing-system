import nodemailer from "nodemailer";
import { getEmailConfig } from "./index";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const emailConfig = getEmailConfig(); // Now called at runtime, not import time
    transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: false, // set to true for port 465, false for other ports
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });
  }
  return transporter;
}

export default getTransporter;