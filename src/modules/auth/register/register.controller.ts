import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RegisterService } from './services/register.service';
import { ApiStandardResponses } from '../../../common';
import { RegisterDto, RegisterResponseDto } from './dto';

@ApiTags('Auth')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      otpFirst: {
        summary: 'Register with phone + OTP (no password)',
        value: {
          phoneNumber: '+1234567890',
          otp: '123456',
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe'
        }
      },
      withPassword: {
        summary: 'Register with optional password',
        value: {
          phoneNumber: '+1234567890',
          otp: '123456',
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiStandardResponses(RegisterResponseDto, {
    successStatus: 201,
    includeAuth: false,
    includeValidation: true,
    includeConflict: true
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.registerService.register(registerDto);
  }
}
