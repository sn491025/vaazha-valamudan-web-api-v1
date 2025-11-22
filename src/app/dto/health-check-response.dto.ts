import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Health check message',
    example: 'Application is running successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-01T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 3600
  })
  uptime: number;
}
