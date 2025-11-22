import { Injectable, Logger } from '@nestjs/common';
import { OtpSender } from './otp-sender.interface';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailOtpService implements OtpSender {
  private readonly logger = new Logger(EmailOtpService.name);
  private readonly expiryMinutes: number;
  private readonly appName: string;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {
    this.expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 10);
    this.appName = this.configService.get<string>('APP_NAME', 'Our Application');
  }

  async send(recipient: string, code: string, purposeText: string): Promise<void> {
    try {
      const subject = `${code} is your verification code for ${this.appName}`;

      // Create HTML email content
      const htmlContent = this.generateHtmlEmail(code, purposeText, this.expiryMinutes);

      // Create plain text fallback
      const textContent = this.generateTextEmail(code, purposeText, this.expiryMinutes);

      await this.emailService.sendEmail(recipient, subject, textContent, htmlContent);

      // Log OTP in development environment only
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.debug(`OTP sent to ${recipient}: ${code} (${purposeText})`);
      } else {
        this.logger.log(`OTP sent to ${recipient} for ${purposeText}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${recipient}`, error.stack);
      throw new Error('Failed to send verification code via email');
    }
  }

  private generateHtmlEmail(code: string, purposeText: string, expiryMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            background-color: white;
            border: 1px solid #e9ecef;
            border-radius: 0 0 5px 5px;
          }
          .code-container {
            background-color: #f8f9fa;
            border: 1px dashed #ced4da;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #495057;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #6c757d;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin-top: 20px;
            font-size: 14px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${this.appName}</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Please use the verification code below for <strong>${purposeText}</strong>:</p>
            
            <div class="code-container">
              <div class="code">${code}</div>
            </div>
            
            <p>This code will expire in <strong>${expiryMinutes} minutes</strong>.</p>
            
            <div class="warning">
              <p>For your security:</p>
              <ul>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for this code</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTextEmail(code: string, purposeText: string, expiryMinutes: number): string {
    return `
      ${this.appName} - Verification Code
      
      Hello,
      
      Please use the verification code below for ${purposeText}:
      
      ${code}
      
      This code will expire in ${expiryMinutes} minutes.
      
      For your security:
      - Never share this code with anyone
      - Our team will never ask for this code
      - If you didn't request this code, please ignore this email
      
      This is an automated message, please do not reply to this email.
      © ${new Date().getFullYear()} ${this.appName}. All rights reserved.
    `;
  }
}
