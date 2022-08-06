import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

import { ScheduledTaskStatus, ScheduledTaskType } from '../../../core/domain/model/types';

export class GetScheduledTasksQueryParamsDto {
  @IsOptional()
  @IsUUID(4, { each: true })
  @ApiPropertyOptional({ type: String, isArray: true })
  ids?: string[];

  @IsOptional()
  @IsNotEmpty({ each: true })
  @ApiPropertyOptional({ type: String, isArray: true })
  types?: string[];

  @IsOptional()
  @IsIn(['interval', 'cronjob'], { each: true })
  @ApiPropertyOptional({ enum: ['interval', 'cronjob'], isArray: true })
  taskTypes?: ScheduledTaskType[];

  @IsOptional()
  @IsEnum(ScheduledTaskStatus, { each: true })
  @ApiPropertyOptional({ enum: ScheduledTaskStatus, isArray: true })
  statuses?: ScheduledTaskStatus[];

  @IsOptional()
  @IsJSON({ each: true })
  @ApiPropertyOptional({ type: String, isArray: true })
  tags?: string[];

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
