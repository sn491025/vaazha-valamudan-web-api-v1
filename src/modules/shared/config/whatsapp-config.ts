import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface WhatsappConfig {
  apiUrl: string;
  apiToken: string;
  templateName: string;
  languageCode: string;
}

export const whatsappConfig = registerAs('whatsapp', (): WhatsappConfig => ({
  apiUrl: process.env.WHATSAPP_API_URL || '',
  apiToken: process.env.WHATSAPP_API_TOKEN || '',
  templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'otp_verification',
  languageCode: process.env.WHATSAPP_LANGUAGE_CODE || 'en',
}));

export const whatsappConfigValidation = {
  WHATSAPP_API_URL: Joi.string().uri().required(),
  WHATSAPP_API_TOKEN: Joi.string().required(),
  WHATSAPP_TEMPLATE_NAME: Joi.string().optional().default('otp_verification'),
  WHATSAPP_LANGUAGE_CODE: Joi.string().optional().default('en'),
};