import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { OtpSender } from './otp-sender.interface';
import { WhatsappConfig } from '../../config/whatsapp-config';
import {
  WhatsAppApiResponse,
  WhatsAppMessageRequest,
  WhatsAppTemplateComponent
} from '../../dtos/whatsapp-template.dto';



@Injectable()
export class WhatsAppOtpService implements OtpSender {
  private readonly logger = new Logger(WhatsAppOtpService.name);
  private readonly config: WhatsappConfig;

  constructor(
    private readonly httpService: HttpService,
  ) {
    this.config = {
      apiUrl: process.env.WHATSAPP_API_URL || '',
      apiToken: process.env.WHATSAPP_API_TOKEN || '',
      templateName: process.env.WHATSAPP_TEMPLATE_NAME || '',
      languageCode: process.env.WHATSAPP_LANGUAGE_CODE || '',
    };
  }

  async send(recipient: string, code: string, purposeText: string): Promise<void> {
    const formattedPhone = this.formatPhoneNumber(recipient);

    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`🔐 [WhatsApp] OTP for ${formattedPhone}: ${code} (${purposeText})`);
      if (process.env.WHATSAPP_ENABLED === 'false') {
        this.logger.debug('Skipping actual WhatsApp API call in development mode');
        return;
      }
    }

    const payload = this.buildTemplatePayload(formattedPhone, code);

    try {
      const response = await this.sendMessage(payload);
      this.logger.log(
        `WhatsApp OTP sent successfully to ${this.maskPhoneNumber(formattedPhone)} | MessageID: ${response.message_id}`,
      );
    } catch (error) {
      this.handleError(error, formattedPhone);
    }
  }

  private buildTemplatePayload(phone: string, otp: string): WhatsAppMessageRequest {
    const components: WhatsAppTemplateComponent[] = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: otp,
          },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: otp,
          },
        ],
      },
    ];

    return {
      to: phone,
      type: 'template',
      template: {
        language: {
          policy: 'deterministic',
          code: this.config.languageCode,
        },
        name: this.config.templateName,
        components,
      },
    };
  }

  private async sendMessage(payload: WhatsAppMessageRequest): Promise<WhatsAppApiResponse> {
    const url = `${this.config.apiUrl}?token=${this.config.apiToken}`;

    const response = await firstValueFrom(
      this.httpService.post<WhatsAppApiResponse>(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }),
    );

    if (!response.data.success && response.data.error) {
      throw new WhatsAppApiError(
        response.data.error.code,
        response.data.error.message,
      );
    }

    return response.data;
  }

  /**
   * Formats phone number to WhatsApp expected format
   * Ensures the number starts with country code (e.g., 91 for India)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If number starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // If number is 10 digits (Indian mobile), prepend 91
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }

    // If number doesn't have country code, assume India
    if (cleaned.length === 10) {
      cleaned = `91${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Masks phone number for logging (privacy)
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) {
      return '****';
    }
    return phone.slice(0, 2) + '****' + phone.slice(-4);
  }

  private handleError(error: unknown, phone: string): never {
    const maskedPhone = this.maskPhoneNumber(phone);

    if (error instanceof WhatsAppApiError) {
      this.logger.error(
        `WhatsApp API Error for ${maskedPhone}: [${error.code}] ${error.message}`,
      );
      throw error;
    }

    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      this.logger.error(
        `WhatsApp HTTP Error for ${maskedPhone}: Status ${statusCode}`,
        errorData,
      );

      if (!statusCode) {
        throw new WhatsAppApiError('SERVER_ERROR', 'WhatsApp service temporarily unavailable');
      }

      if (statusCode === 401 || statusCode === 403) {
        throw new WhatsAppApiError('AUTH_ERROR', 'Invalid API token or unauthorized');
      }

      if (statusCode === 429) {
        throw new WhatsAppApiError('RATE_LIMIT', 'Too many requests, please try again later');
      }

      if (statusCode >= 500) {
        throw new WhatsAppApiError('SERVER_ERROR', 'WhatsApp service temporarily unavailable');
      }

      throw new WhatsAppApiError(
        'HTTP_ERROR',
        error.message || 'Failed to send WhatsApp message',
      );
    }

    this.logger.error(`Unexpected error sending WhatsApp OTP to ${maskedPhone}`, error);
    throw new WhatsAppApiError('UNKNOWN_ERROR', 'Failed to send WhatsApp OTP');
  }
}

export class WhatsAppApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'WhatsAppApiError';
  }
}