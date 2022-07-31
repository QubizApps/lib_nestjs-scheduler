import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, Matches } from 'class-validator';

const INTERVAL_REGEX =
  /(@(yearly|monthly|weekly|daily|hourly))|(@every (\d+(ns|us|µs|ms|s|m|h)))|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autostart?: boolean;
}
