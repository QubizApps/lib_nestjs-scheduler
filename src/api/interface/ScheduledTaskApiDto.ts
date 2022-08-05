import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduledTaskOutputApiDto {
  @ApiProperty()
  data!: any;
}

export class ScheduledTaskErrorApiDto {
  @ApiProperty()
  message!: string;

  @ApiPropertyOptional()
  stack?: string;
}

export class ScheduledTaskApiDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  interval!: string;

  @ApiProperty({ type: Object })
  params!: { [key: string]: any };

  @ApiProperty({ type: Object })
  tags!: { [key: string]: string };

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ type: ScheduledTaskOutputApiDto })
  output?: ScheduledTaskOutputApiDto;

  @ApiPropertyOptional({ type: ScheduledTaskErrorApiDto })
  error?: ScheduledTaskErrorApiDto;

  @ApiPropertyOptional()
  runAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  createdAt!: Date;
}
