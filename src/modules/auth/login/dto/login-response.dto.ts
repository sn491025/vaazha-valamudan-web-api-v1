import { ApiProperty } from '@nestjs/swagger';
import { UserInfoDto } from './user-info.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: UserInfoDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['USER'],
      isActive: true,
      agent: {
        agent_id: '123e4567-e89b-12d3-a456-426614174000',
        agent_name: 'Agent 1',
      }
    }
  })
  user: UserInfoDto;
}
