import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpService } from './services/otp/otp.service';
import { EmailService } from './services/email/email.service';
import { Otp } from './entities/otp.entity';
import { DeviceSession } from './entities/device-session.entity';

import { DeviceSessionService } from './services/auth/device-session.service';
import { SmsOtpService } from './services/otp/sms-otp.service';
import { EmailOtpService } from './services/otp/email-otp.service';
import { WhatsAppOtpService } from './services/otp/whatsapp-otp.service';
import { CustomOtpService } from './services/otp/custom-otp.service';
import { S3StorageService } from './storage/s3-storage.service';
import { HttpModule } from '@nestjs/axios';

const services = [
  OtpService,
  EmailService,
  DeviceSessionService,
  SmsOtpService,
  EmailOtpService,
  WhatsAppOtpService,
  CustomOtpService,
  S3StorageService
];


@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Otp, DeviceSession]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
  ],
  providers: services,
  exports: services,
})
export class SharedModule {}
