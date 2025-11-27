import { ApiProperty } from '@nestjs/swagger';
import { AgentProfileInfoDto } from './agent-profile-info.dto';

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
    description: 'User agent ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  agent?: AgentProfileInfoDto;

  @ApiProperty({
    description: 'User account status',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User roles',
    type: [String],
    example: ['USER', 'AGENT']
  })
  roles: string[];
}

