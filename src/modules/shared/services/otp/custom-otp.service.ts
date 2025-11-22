import { Injectable } from '@nestjs/common';
import { OtpSender } from './otp-sender.interface';

@Injectable()
export class CustomOtpService implements OtpSender {
  async send(recipient: string, code: string, purposeText: string): Promise<void> {
    // Placeholder for custom delivery channel
    console.log(`Sending Custom OTP ${code} to ${recipient} for ${purposeText}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 [Custom] OTP for ${recipient}: ${code} (${purposeText})`);
    }
  }
}
