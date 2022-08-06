import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
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
  @Transform((t) => t.value.split(','))
  @IsUUID(4, { each: true })
  ids?: string[];

  @IsOptional()
  @Transform((t) => t.value.split(','))
  @IsNotEmpty({ each: true })
  types?: string[];

  @IsOptional()
  @Transform((t) => t.value.split(','))
  @IsIn(['interval', 'cronjob'], { each: true })
  taskTypes?: ScheduledTaskType[];

  @IsOptional()
  @Transform((t) => t.value.split(','))
  @IsEnum(ScheduledTaskStatus, { each: true })
  statuses?: ScheduledTaskStatus[];

  @IsOptional()
  @Transform((t) => t.value.split('|'))
  @IsJSON({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform((t) => +t.value)
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Transform((t) => +t.value)
  @IsNumber()
  @Min(0)
  limit?: number;
}

export const GetScheduledTasksQueryParams = () =>
  applyDecorators(
    ApiQuery({ name: 'ids', explode: false, type: String, isArray: true, required: false }),
    ApiQuery({ name: 'types', explode: false, type: String, isArray: true, required: false }),
    ApiQuery({
      name: 'taskTypes',
      explode: false,
      enum: ['interval', 'cronjob'],
      isArray: true,
      required: false,
    }),
    ApiQuery({
      name: 'statuses',
      explode: false,
      enum: ScheduledTaskStatus,
      isArray: true,
      required: false,
    }),
    ApiQuery({
      name: 'tags',
      explode: false,
      type: String,
      isArray: true,
      required: false,
      style: 'pipeDelimited',
    }),
    ApiQuery({ name: 'offset', type: Number, required: false }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
  );
