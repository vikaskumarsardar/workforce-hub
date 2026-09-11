import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ExecutePayrollDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Period must be in YYYY-MM format (e.g. 2026-09)',
  })
  period: string;
}
