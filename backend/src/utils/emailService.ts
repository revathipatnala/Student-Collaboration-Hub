import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();



class EmailService {
  private transporter: nodemailer.Transporter;
  

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOTP(email: string, otp: string, purpose: 'signup' | 'signin'): Promise<void> {
    const subject = purpose === 'signup' ? 'Welcome to Student Collaboration Hub - Verify Your Email' : 'Student Collaboration Hub - Sign In Verification';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #fff; background: #2563eb; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 8px; letter-spacing: 4px; }
            h2, p, .footer { color: #fff !important; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Student Collaboration Hub</div>
            </div>
            <h2>${purpose === 'signup' ? 'Welcome to Student Collaboration Hub!' : 'Sign In to Student Collaboration Hub'}</h2>
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The Student Collaboration Hub Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"STUDENT COLLABORATION HUB" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });
  }
}

export default new EmailService();