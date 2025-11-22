import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsNumber,
  IsEmail,
  IsLongitude,
  IsLatitude
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentCompanyProfileDto {
  @ApiProperty({ description: 'Company display name', example: 'Acme Corp' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  companyName: string;

  @ApiProperty({ description: 'User UUID who owns the profile', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Optional profile name', example: 'Acme Sales', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  profileName?: string;

  @ApiProperty({ description: 'Short title for listings', example: 'Acme', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortTitle?: string;

  @ApiProperty({ description: 'Detailed description of the company', example: 'Full service provider of widgets and solutions.', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'GST number (if applicable)', example: '22AAAAA0000A1Z5', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  gstNumber?: string;

  @ApiProperty({ description: 'Primary contact name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact_name?: string;

  @ApiProperty({ description: 'Primary contact phone', example: '+911234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contact_phone?: string;

  @ApiProperty({ description: 'Primary contact email', example: 'contact@acme.com', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contact_email?: string;

  @ApiProperty({ description: 'Expiry days for temporary profiles', example: 365, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  expiryDays?: number;

  @ApiProperty({ description: 'Door number', example: '12A' })
  @IsString()
  door_number: string;

  @ApiProperty({ description: 'Street name', example: 'Main Street' })
  @IsString()
  street_name: string;

  @ApiProperty({ description: 'Full address line', example: '12A, Main Street, Near Park', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address_line?: string;

  @ApiProperty({ description: 'City name', example: 'Chennai', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'District name', example: 'Chennai', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ description: 'State or province', example: 'Tamil Nadu', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiProperty({ description: 'Postal / ZIP code', example: '600001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postal_code?: string;

  @ApiProperty({ description: 'Country', example: 'India', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Latitude coordinate', example: 13.0827, required: false })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', example: 80.2707, required: false })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
