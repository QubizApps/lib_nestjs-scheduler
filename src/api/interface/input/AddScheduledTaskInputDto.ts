import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, Matches } from 'class-validator';

import { INTERVAL_REGEX } from '../../../constants';

export class AddScheduledTaskInputDto {
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  type!: string;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(INTERVAL_REGEX)
  interval!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  params?: { [key: string]: any };

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  tags?: { [key: string]: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autostart?: boolean;
}
