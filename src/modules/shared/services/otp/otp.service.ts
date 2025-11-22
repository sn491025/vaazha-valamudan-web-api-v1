import {
  Injectable,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { Otp } from '../../entities/otp.entity';
import { OtpPurpose } from '../../enums/otp-purpose.enum';
import { OtpType } from '../../enums/otp-type.enum';
import { SmsOtpService } from './sms-otp.service';
import { EmailOtpService } from './email-otp.service';
import { WhatsAppOtpService } from './whatsapp-otp.service';
import { CustomOtpService } from './custom-otp.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly RATE_LIMIT_MINUTES = 2; // Minimum time between OTP requests

  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    private readonly smsOtpService: SmsOtpService,
    private readonly emailOtpService: EmailOtpService,
    private readonly whatsAppOtpService: WhatsAppOtpService,
    private readonly customOtpService: CustomOtpService
  ) {}

  async generateAndSendOtp(
    phoneNumber: string,
    email: string | null = null,
    purpose: OtpPurpose,
    otpTypes?: OtpType | OtpType[],
    referanceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    try {
      // Check rate limiting
      await this.checkRateLimit(phoneNumber, purpose);

      // Invalidate any existing OTPs for this phone number and purpose
      await this.invalidateExistingOtps(phoneNumber, purpose);

      // Generate 6-digit OTP
      const code = this.generateOtpCode();

      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

      // Normalize and dedupe channels
      const normalizedTypes = this.normalizeOtpTypes(otpTypes);

      // Store OTP in a database (single record with multiple channels)
      const otp = this.otpRepository.create({
        phoneNumber,
        code,
        purpose,
        otpTypes: normalizedTypes,
        expiresAt,
        referanceId,
        ipAddress,
        userAgent
      });

      await this.otpRepository.save(otp);

      // Send across all requested channels
      await this.sendOtp(phoneNumber, email, code, purpose, normalizedTypes);

      return {
        message: `OTP sent successfully to ${phoneNumber}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async verifyOtp(
    phoneNumber: string,
    code: string,
    purpose: OtpPurpose,
    ipAddress?: string
  ): Promise<{ isValid: boolean; userId?: string }> {
    try {
      // Find the most recent valid OTP
      const otp = await this.otpRepository.findOne({
        where: {
          phoneNumber,
          purpose,
          isUsed: false
        },
        order: { createdAt: 'DESC' }
      });

      if (!otp) {
        throw new BadRequestException(
          'No valid OTP found. Please request a new one.'
        );
      }

      // Check if OTP is expired
      if (new Date() > otp.expiresAt) {
        await this.markOtpAsUsed(otp.id);
        throw new BadRequestException(
          'OTP has expired. Please request a new one.'
        );
      }

      // Check attempt count
      if (otp.attemptCount >= this.MAX_ATTEMPTS) {
        await this.markOtpAsUsed(otp.id);
        throw new BadRequestException(
          'Maximum OTP verification attempts exceeded. Please request a new one.'
        );
      }

      // Increment attempt count
      await this.incrementAttemptCount(otp.id);

      // Verify OTP code - allow hardcoded "111111" for development
      const isValidCode = otp.code === code || 
        (code === '111111' && (process.env.NODE_ENV === 'development' || !process.env.SMS_GATEWAY_ENABLED));

      if (!isValidCode) {
          throw new BadRequestException(
            `Invalid OTP. ${this.MAX_ATTEMPTS - (otp.attemptCount + 1)} attempts remaining.`
          );
      }

      // Mark OTP as used
      await this.markOtpAsUsed(otp.id);

      return {
        isValid: true,
        userId: otp.referanceId || ''
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  async hasValidOtp(
    phoneNumber: string,
    purpose: OtpPurpose
  ): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: {
        phoneNumber,
        purpose,
        isUsed: false,
        expiresAt: LessThan(new Date())
      }
    });

    return !!otp;
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async checkRateLimit(
    phoneNumber: string,
    purpose: OtpPurpose
  ): Promise<void> {
    const utcDate = new Date().toUTCString();
    const rateLimitTime = new Date(utcDate);
    rateLimitTime.setMinutes(
      rateLimitTime.getMinutes() - this.RATE_LIMIT_MINUTES
    );

    const recentOtp = await this.otpRepository.findOne({
      where: {
        phoneNumber,
        purpose,
        createdAt: MoreThanOrEqual(rateLimitTime)
      },
      order: { createdAt: 'DESC' }
    });

    if (recentOtp) {
      const waitTime = Math.ceil(
        (this.RATE_LIMIT_MINUTES * 60000 -
          (Date.now() - recentOtp.createdAt.getTime())) /
          1000
      );
      throw new BadRequestException(
        `Please wait ${waitTime} seconds before requesting another OTP`
      );
    }
  }

  private async invalidateExistingOtps(
    phoneNumber: string,
    purpose: OtpPurpose
  ): Promise<void> {
    await this.otpRepository.update(
      {
        phoneNumber,
        purpose,
        isUsed: false
      },
      {
        isUsed: true
      }
    );
  }

  private async markOtpAsUsed(otpId: string): Promise<void> {
    await this.otpRepository.update(otpId, { isUsed: true });
  }

  private async incrementAttemptCount(otpId: string): Promise<void> {
    await this.otpRepository.increment({ id: otpId }, 'attemptCount', 1);
  }

  private normalizeOtpTypes(otpTypes?: OtpType | OtpType[]): OtpType[] {
    const types = Array.isArray(otpTypes)
      ? otpTypes
      : otpTypes
        ? [otpTypes]
        : [OtpType.SMS_OTP];
    return Array.from(new Set(types)); // ensure no duplicates
  }

  private async sendOtp(
    recipient: string,
    email: string | null,
    code: string,
    purpose: OtpPurpose,
    otpTypes: OtpType[]
  ): Promise<void> {
    const purposeText = this.getPurposeText(purpose);
    for (const type of otpTypes) {
      switch (type) {
        case OtpType.EMAIL_OTP:
          if (email) {
            await this.emailOtpService.send(email, code, purposeText);
          }
          break;
        case OtpType.WHATSAPP_OTP:
          await this.whatsAppOtpService.send(recipient, code, purposeText);
          break;
        case OtpType.CUSTOM_OTP:
          await this.customOtpService.send(recipient, code, purposeText);
          break;
        case OtpType.SMS_OTP:
        default:
          await this.smsOtpService.send(recipient, code, purposeText);
          break;
      }
    }
  }

  private getPurposeText(purpose: OtpPurpose): string {
    switch (purpose) {
      case OtpPurpose.REGISTRATION:
        return 'account registration';
      case OtpPurpose.LOGIN:
        return 'login';
      case OtpPurpose.FORGOT_PASSWORD:
        return 'password reset';
      case OtpPurpose.PHONE_VERIFICATION:
        return 'phone verification';
      default:
        return 'verification';
    }
  }

  // Cleanup expired OTPs (should be called periodically)
  async cleanupExpiredOtps(): Promise<void> {
    const result = await this.otpRepository.delete({
      expiresAt: LessThan(new Date())
    });

    if (result.affected && result.affected > 0) {
      console.log(`Cleaned up ${result.affected} expired OTPs`);
    }
  }
}
