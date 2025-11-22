import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_SMTP_HOST'),
        port: this.configService.get<number>('EMAIL_SMTP_PORT', 587),
        secure: this.configService.get<boolean>('EMAIL_SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('EMAIL_SMTP_USER'),
          pass: this.configService.get<string>('EMAIL_SMTP_PASSWORD'),
        },
      });

      this.logger.log('SMTP email service initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize SMTP email service: ${error.message}`, error.stack);

      // Fallback to console for development
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.warn('Using console logger as email fallback in development');
        this.transporter = {
          sendMail: async (options) => {
            this.logger.debug(
              `[DEV EMAIL] To: ${options.to}, Subject: ${options.subject}`,
              { to: options.to, subject: options.subject, text: options.text }
            );
            return { messageId: `mock-${Date.now()}` };
          },
        } as any;
      } else {
        throw error;
      }
    }
  }

  /**
   * Send an email with both text and HTML content
   */
  async sendEmail(
    to: string,
    subject: string,
    textContent: string,
    htmlContent?: string,
    options: {
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: nodemailer.Attachment[];
      replyTo?: string;
    } = {}
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('SMTP transporter not initialized');
      }

      const from = this.configService.get<string>('EMAIL_FROM');
      const appName = this.configService.get<string>('APP_NAME', 'Your Application');

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${appName}" <${from}>`,
        to,
        subject,
        text: textContent,
        ...options,
      };

      if (htmlContent) {
        mailOptions.html = htmlContent;
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}: ${subject} (${info.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);

      if (this.configService.get<boolean>('EMAIL_THROW_ERRORS', false)) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed', error.stack);
      return false;
    }
  }
}
