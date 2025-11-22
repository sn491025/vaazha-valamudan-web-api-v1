import { Injectable, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BusinessException } from '../../../../common';
import { ProfileService } from '../../../users';
import { OtpPurpose, OtpService } from '../../../shared';
import { SendRegistrationOtpDto } from '../dto/send-registration-otp.dto';
import { RegisterDto, RegisterResponseDto } from '../dto';


@Injectable()
export class RegisterService {
  constructor(
    private usersService: ProfileService,
    private otpService: OtpService,
  ) {}

  async sendRegistrationOtp(
    sendOtpDto: SendRegistrationOtpDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    try {
      const { phoneNumber } = sendOtpDto;

      // Check if phone number already exists
      const existingUser = await this.usersService.findByPhoneNumber(phoneNumber);
      if (existingUser) {
        throw new ConflictException('User with this phone number already exists');
      }

      // Generate and send OTP
      return await this.otpService.generateAndSendOtp(
        phoneNumber,
        null,
        OtpPurpose.REGISTRATION,
        undefined,
        ipAddress,
        userAgent
      );
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send registration OTP');
    }
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      const { email, phoneNumber, otp, password, firstName, lastName, referralCode } = registerDto;

      // Verify OTP first
      const otpVerification = await this.otpService.verifyOtp(
        phoneNumber,
        otp,
        OtpPurpose.REGISTRATION
      );

      if (!otpVerification.isValid) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      // Check if user already exists with phone number
      const existingUserWithPhone = await this.usersService.findByPhoneNumber(phoneNumber);
      if (existingUserWithPhone) {
        throw new ConflictException('User with this phone number already exists');
      }

      // Check if user already exists with email (if provided)
      if (email) {
        const existingUserWithEmail = await this.usersService.findByEmail(email);
        if (existingUserWithEmail) {
          throw new ConflictException('User with this email already exists');
        }
      }

      // Hash the password (optional)
      const saltRounds = 12;
      const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : undefined;

      // Create user data - combine firstName and lastName into fullName
      const createUserData: {
        email?: string;
        password?: string;
        fullName: string;
        phoneNumber: string;
        isActive: boolean;
        referredByCode?: string;
      } = {
        fullName: `${firstName} ${lastName}`.trim(),
        phoneNumber,
        isActive: true,
      };

      if (email) createUserData.email = email;
      if (hashedPassword) createUserData.password = hashedPassword;
      if (referralCode) createUserData.referredByCode = referralCode;

      // Create the user with referral support
      const user = await this.usersService.createWithReferral(createUserData);

      // Return response without sensitive data
      return {
        id: user.id,
        email: user.email || '',
        firstName,
        lastName,
        phoneNumber,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BusinessException || error instanceof BadRequestException) {
        throw error;
      }

      // Handle specific database errors
      if (error.code === '23505') { // PostgreSQL unique violation
        if (error.constraint?.includes('email')) {
          throw new ConflictException('User with this email already exists');
        } else if (error.constraint?.includes('phoneNumber')) {
          throw new ConflictException('User with this phone number already exists');
        } else if (error.constraint?.includes('referralCode')) {
          throw new ConflictException('Referral code already exists');
        }
        throw new ConflictException('User already exists');
      }

      throw new InternalServerErrorException('Registration failed. Please try again.');
    }
  }

  async validateRegistrationData(registerDto: RegisterDto): Promise<void> {
    // Additional validation logic can be added here
    const { email } = registerDto;

    if (email) {
      // Check for disposable email domains (optional)
      const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
      const emailDomain = email.split('@')[1];

      if (disposableDomains.includes(emailDomain)) {
        throw new BusinessException('Disposable email addresses are not allowed');
      }
    }
  }
}