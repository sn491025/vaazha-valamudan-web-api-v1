import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidateProfileNameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  profileName: string;
}