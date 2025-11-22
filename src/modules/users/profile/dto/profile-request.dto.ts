import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class ProfileRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890'
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}