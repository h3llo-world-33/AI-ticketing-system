import nodemailer from "nodemailer";
import { getEmailConfig } from "./index";

const emailConfig = getEmailConfig();

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false, // set to true for port 465, false for other ports
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

export default transporter;