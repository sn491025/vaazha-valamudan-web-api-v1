/**
 * WhatsApp Template Message DTOs
 * Based on Inbuilto WhatsApp API specification
 */

export interface WhatsAppTemplateParameter {
  type: 'text' | 'image' | 'document' | 'video';
  text?: string;
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: string;
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplateLanguage {
  policy: 'deterministic' | 'fallback';
  code: string;
}

export interface WhatsAppTemplate {
  language: WhatsAppTemplateLanguage;
  name: string;
  components: WhatsAppTemplateComponent[];
}

export interface WhatsAppMessageRequest {
  to: string;
  type: 'template' | 'text' | 'image' | 'document';
  template?: WhatsAppTemplate;
  text?: {
    body: string;
  };
}

export interface WhatsAppApiResponse {
  success: boolean;
  message_id?: string;
  error?: {
    code: string;
    message: string;
  };
}