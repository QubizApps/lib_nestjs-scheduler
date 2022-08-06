import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsJSON, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { ScheduledTaskStatus, ScheduledTaskType } from '../../../core/domain/model/types';

export class GetScheduledTasksQueryParamsDto {
  @IsOptional()
  @Transform((value) => String(value).split(','))
  @IsUUID(4, { each: true })
  ids?: string[];

  @IsOptional()
  @Transform((value) => String(value).split(','))
  @IsNotEmpty({ each: true })
  types?: string[];

  @IsOptional()
  @Transform((value) => String(value).split(','))
  @IsIn(['interval', 'cronjob'], { each: true })
  taskTypes?: ScheduledTaskType[];

  @IsOptional()
  @Transform((value) => String(value).split(','))
  @IsEnum(ScheduledTaskStatus, { each: true })
  statuses?: ScheduledTaskStatus[];

  @IsOptional()
  @IsJSON({ each: true })
  @ApiPropertyOptional({ type: String, isArray: true })
  tags?: string[];
}
