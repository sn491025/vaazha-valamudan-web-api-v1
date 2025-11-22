import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User phone number in international format',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
}
