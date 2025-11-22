import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Phone number for password reset',
    example: '+1234567890'
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;
}
