import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @IsString()
  @IsNotEmpty()
  adminLastName: string;
}
