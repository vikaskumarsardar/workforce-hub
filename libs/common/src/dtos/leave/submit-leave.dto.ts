import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitLeaveDto {
  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  @IsNotEmpty()
  endDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  reason?: string;
}
