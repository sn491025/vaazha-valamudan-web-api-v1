import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginService } from './services/login.service';
import { ApiStandardResponses } from '../../../common';
import { LoginRequestDto, LoginResponseDto, MobileOtpLoginDto, VerifyOtpDto, RefreshTokenDto, SignOutDto, UpgradeJwtDto } from './dto';
import { PublicTokenGuard } from '../guards/public-token.guard';
import { AccessJwtGuard } from '../guards/access-jwt.guard';
import { RefreshJwtGuard } from '../guards/refresh-jwt.guard';

@ApiTags('Auth')
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // 3) Username and password login API
  @ApiOperation({ summary: 'User login with email/phone and password' })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User credentials',
    examples: {
      emailLogin: {
        summary: 'Login with email',
        value: {
          email: 'user@example.com',
          password: 'password123',
          device: {
            deviceType: 'web',
            deviceId: 'web:session-123',
            platform: 'web',
            firebaseToken: 'fcm:AAAA....'
          }
        }
      },
      phoneLogin: {
        summary: 'Login with phone number',
        value: {
          phoneNumber: '+1234567890',
          password: 'password123',
          device: {
            deviceType: 'mobile',
            deviceId: 'android:abcd-1234',
            platform: 'android',
            firebaseToken: 'fcm:BBBB....'
          }
        }
      }
    }
  })
  @ApiStandardResponses(LoginResponseDto, {
    successStatus: 200,
    includeAuth: false,
    includeValidation: true
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.loginService.login(loginDto);
  }

  // 1) Send OTP to anyone; include user details if registered otherwise null
  @ApiOperation({ summary: 'Send OTP to mobile number (login or registration)' })
  @ApiBody({
    type: MobileOtpLoginDto,
    description: 'Sends OTP. If the number exists, OTP is for login; otherwise, it is for registration.',
    examples: {
      example1: {
        summary: 'Send OTP for any phone number',
        value: {
          phoneNumber: '+1234567890',
          otpTypes: ['whatsapp_otp', 'sms_otp']
        }
      }
    }
  })
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() mobileOtpDto: MobileOtpLoginDto): Promise<{ message: string, isExistingUser: boolean }> {
    return this.loginService.sendLoginOtp(mobileOtpDto.phoneNumber, mobileOtpDto.otpTypes);
  }

  // 2) Verify OTP: if new user, register (requires registration fields); else log in
  @ApiOperation({ summary: 'Verify OTP (auto-login or auto-register then login)' })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'If phone exists, logs in. If not, creates the user (requires registration data) and logs in, then captures device info.',
    examples: {
      existingUser: {
        summary: 'Existing user login (mobile)',
        value: {
          phoneNumber: '+1234567890',
          otp: '123456',
          device: {
            deviceType: 'mobile',
            deviceId: 'android:abcd-1234',
            platform: 'android',
            firebaseToken: 'fcm:BBBB....'
          }
        }
      },
      newUser: {
        summary: 'First-time user registration via OTP (then login)',
        value: {
          phoneNumber: '+1234567890',
          otp: '123456',
          user: {
            email: 'newuser@example.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'password123',
            referralCode: 'ABC12345'
          },
          device: {
            deviceType: 'mobile',
            deviceId: 'android:abcd-1234',
            platform: 'android',
            firebaseToken: 'fcm:BBBB....'
          }
        }
      }
    }
  })
  @ApiStandardResponses(LoginResponseDto, {
    successStatus: 200,
    includeAuth: false,
    includeValidation: true
  })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<LoginResponseDto> {
    return this.loginService.verifyLoginOtp(verifyOtpDto);
  }

  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Provide userId and optional deviceType to refresh tokens'
  })
  @ApiStandardResponses(LoginResponseDto, {
    successStatus: 200,
    includeAuth: false,
    includeValidation: true
  })
  @UseGuards(RefreshJwtGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() dto: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.loginService.refreshTokens(dto.userId, dto.deviceType);
  }

  @ApiOperation({ summary: 'Sign out user (invalidate session if applicable)' })
  @ApiBody({
    type: SignOutDto,
    description: 'Provide userId to sign out'
  })
  @UseGuards(AccessJwtGuard)
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  signOut(@Body() dto: SignOutDto): Promise<{ message: string }> {
    return this.loginService.signOut(dto.userId);
  }

  @ApiOperation({ summary: 'Upgrade to JWT from token-based auth' })
  @ApiBody({
    type: UpgradeJwtDto,
    description: 'Issue JWT tokens for a token-authenticated user if rolesAllowed criteria is met'
  })
  @ApiStandardResponses(LoginResponseDto, {
    successStatus: 200,
    includeAuth: false,
    includeValidation: true
  })
  @UseGuards(PublicTokenGuard)
  @Post('upgrade-jwt')
  @HttpCode(HttpStatus.OK)
  upgradeJwt(@Body() dto: UpgradeJwtDto): Promise<LoginResponseDto> {
    return this.loginService.upgradeJwtAuthByUserId(dto.userId, dto.rolesAllowed ?? ['USER'], dto.deviceType);
  }
}
