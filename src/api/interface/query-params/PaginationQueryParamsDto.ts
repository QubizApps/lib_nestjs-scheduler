import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationQueryParamsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform((value) => +value)
  @ApiPropertyOptional()
  offset?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform((value) => +value)
  @ApiPropertyOptional()
  limit?: number;
}
