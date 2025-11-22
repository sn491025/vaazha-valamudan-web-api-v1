import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentCompanyProfileDto } from './create-agent-company-profile.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAgentCompanyProfileDto extends PartialType(CreateAgentCompanyProfileDto) {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDeactivated?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isVerified?: boolean;
}