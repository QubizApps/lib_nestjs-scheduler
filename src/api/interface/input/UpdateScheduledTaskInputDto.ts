import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, Matches } from 'class-validator';

import { INTERVAL_REGEX } from '../../../constants';

export class UpdateScheduledTaskInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @Matches(INTERVAL_REGEX)
  interval?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  params?: { [key: string]: any };

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  tags?: { [key: string]: string };
}
