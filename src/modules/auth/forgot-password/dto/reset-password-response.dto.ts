import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password has been reset successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-01-01T10:30:00.000Z'
  })
  timestamp: string;
}
