import { Controller, Post, Body, HttpCode, HttpStatus, Patch, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ForgotPasswordService } from './services/forgot-password.service';
import { ApiStandardResponses } from '../../../common';
import { ForgotPasswordDto, ForgotPasswordResponseDto, ResetPasswordDto, ResetPasswordResponseDto } from './dto';

@ApiTags('Auth')
@Controller('forgot-password')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Phone number for password reset',
    examples: {
      example1: {
        summary: 'Request password reset OTP',
        value: {
          phoneNumber: '+1234567890'
        }
      }
    }
  })
  @ApiStandardResponses(ForgotPasswordResponseDto, {
    successStatus: 200,
    includeAuth: false,
    includeValidation: true
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  requestPasswordReset(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<ForgotPasswordResponseDto> {
    return this.forgotPasswordService.sendResetOtp(forgotPasswordDto.phoneNumber, ipAddress, userAgent);
  }

  @ApiOperation({ summary: 'Reset password with OTP verification' })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset password data with OTP',
    examples: {
      example1: {
        summary: 'Reset password with OTP',
        value: {
          phoneNumber: '+1234567890',
          otp: '123456',
          newPassword: 'newPassword123'
        }
      }
    }
  })
  @ApiStandardResponses(ResetPasswordResponseDto, {
    successStatus: 200,
    includeAuth: false,
    includeValidation: true
  })
  @Patch('reset')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ): Promise<ResetPasswordResponseDto> {
    return this.forgotPasswordService.resetPassword(resetPasswordDto, ipAddress, userAgent);
  }
}
