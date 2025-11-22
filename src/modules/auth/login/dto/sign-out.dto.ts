import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignOutDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  @IsString()
  userId: string;
}
