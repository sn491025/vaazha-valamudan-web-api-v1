import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset OTP has been sent to your phone number'
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-01T10:30:00.000Z'
  })
  timestamp: string;
}
