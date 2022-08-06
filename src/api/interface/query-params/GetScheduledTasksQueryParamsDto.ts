import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsJSON, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

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
}
