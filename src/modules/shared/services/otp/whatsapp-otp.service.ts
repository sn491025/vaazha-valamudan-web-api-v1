import { Injectable } from '@nestjs/common';
import { OtpSender } from './otp-sender.interface';

@Injectable()
export class WhatsAppOtpService implements OtpSender {
  async send(recipient: string, code: string, purposeText: string): Promise<void> {
    // TODO: Integrate with WhatsApp provider (e.g., Twilio WhatsApp)
    console.log(`Sending WhatsApp OTP ${code} to ${recipient} for ${purposeText}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [WhatsApp] OTP for ${recipient}: ${code} (${purposeText})`);
    }
  }
}
