import { Injectable } from '@nestjs/common';
import { OtpSender } from './otp-sender.interface';

@Injectable()
export class SmsOtpService implements OtpSender {
  async send(recipient: string, code: string, purposeText: string): Promise<void> {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    console.log(`Sending SMS OTP ${code} to ${recipient} for ${purposeText}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [SMS] OTP for ${recipient}: ${code} (${purposeText})`);
    }
  }
}
