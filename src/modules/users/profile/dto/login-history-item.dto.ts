import { ApiProperty } from '@nestjs/swagger';

export class LoginHistoryItemDto {
  @ApiProperty({
    description: 'Login history entry ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'IP address used for login',
    example: '192.168.1.1'
  })
  ipAddress: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  userAgent: string;

  @ApiProperty({
    description: 'Login timestamp',
    example: '2024-01-01T10:30:00.000Z'
  })
  loginAt: Date;
}
