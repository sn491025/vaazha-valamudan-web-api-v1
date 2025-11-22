import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, Length, isNotEmpty } from 'class-validator';

export class UserInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;


  @ApiProperty({
    description: 'User phone number',
    example: '+919884562624'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: 'User roles',
    type: [String],
    example: ['USER', 'AGENT']
  })
  roles: string[];
}

