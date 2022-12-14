import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Uuid } from '@qubizapps/nestjs-commons';

import {
  AddScheduledTask,
  ReloadScheduledTasks,
  RemoveScheduledTask,
  RunScheduledTask,
  StartScheduledTask,
  StopScheduledTask,
  UpdateScheduledTask,
} from '../../core/application/command/commands';
import { GetScheduledTasks } from '../../core/application/query/queries';
import { ScheduledTask } from '../../core/domain/model/ScheduledTask';
import { ScheduledTaskDto } from '../../core/read/dto/ScheduledTaskDto';
import { FinderResult } from '../../core/read/service/types';
import { SchedulerModuleOptions } from '../../SchedulerModuleOptions';
import { AddScheduledTaskInputDto } from '../interface/input/AddScheduledTaskInputDto';
import { UpdateScheduledTaskInputDto } from '../interface/input/UpdateScheduledTaskInputDto';
import {
  GetScheduledTasksQueryParams,
  GetScheduledTasksQueryParamsDto,
} from '../interface/query-params/GetScheduledTasksQueryParamsDto';
import { ResultApiDto } from '../interface/ResultApiDto';
import { ScheduledTaskApiDto } from '../interface/ScheduledTaskApiDto';
import { ScheduledTaskApiMapper } from '../mapper/index';
import { ApiResultDtoResponse } from '../utils';

@Controller('scheduler')
@ApiTags('scheduler')
export class SchedulerController {
  constructor(
    private readonly options: SchedulerModuleOptions,
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Get('/tasks/types')
  async getValidTaskTypes(): Promise<string[]> {
    return this.options.scheduler.types;
  }

  @Get('/tasks')
  @GetScheduledTasksQueryParams()
  @ApiExtraModels(ScheduledTaskApiDto)
  @ApiResponse({ status: 200, schema: ApiResultDtoResponse(ScheduledTaskApiDto, true) })
  async getScheduledTasks(
    @Query() params: GetScheduledTasksQueryParamsDto,
  ): Promise<ResultApiDto<ScheduledTaskApiDto[]>> {
    const { tags } = params;

    return this.queries
      .execute<GetScheduledTasks, FinderResult<ScheduledTaskDto[]>>(
        new GetScheduledTasks({ ...params, tags: tags?.map((t) => JSON.parse(t)) }),
      )
      .then((res) => ({
        ...res,
        data: res.data.map(ScheduledTaskApiMapper.readDtoToApiDto) as ScheduledTaskApiDto[],
      }));
  }

  @Get('/tasks/:id')
  @ApiExtraModels(ScheduledTaskApiDto)
  @ApiResponse({ status: 200, schema: ApiResultDtoResponse(ScheduledTaskApiDto, false) })
  async getScheduledTask(
    @Param('id') id: string,
  ): Promise<ResultApiDto<ScheduledTaskApiDto | null>> {
    return this.queries
      .execute<GetScheduledTasks, FinderResult<ScheduledTaskDto[]>>(
        new GetScheduledTasks({ ids: [id] }),
      )
      .then((res) => ({
        data: ScheduledTaskApiMapper.readDtoToApiDto(res.data?.[0]),
      }));
  }

  @Post('/tasks')
  @ApiResponse({ status: 200, schema: ApiResultDtoResponse(ScheduledTaskApiDto, false) })
  async addScheduledTask(
    @Body() input: AddScheduledTaskInputDto,
  ): Promise<ResultApiDto<ScheduledTaskApiDto>> {
    if (!this.options.scheduler.types.includes(input.type)) {
      throw new BadRequestException(`Task type ${input.type} is not allowed`);
    }

    return this.commands
      .execute<AddScheduledTask, ScheduledTask>(
        new AddScheduledTask({
          ...input,
        }),
      )
      .then((task) => ({
        data: ScheduledTaskApiMapper.domainToDto(task),
      }));
  }

  @Put('/tasks/:id')
  async updateScheduledTask(
    @Param('id') id: string,
    @Body() input: UpdateScheduledTaskInputDto,
  ): Promise<void> {
    if (input.type && !this.options.scheduler.types.includes(input.type)) {
      throw new BadRequestException(`Task type ${input.type} is not allowed`);
    }

    return this.commands.execute(
      new UpdateScheduledTask({
        id: Uuid.fromString(id),
        ...input,
      }),
    );
  }

  @Post('/tasks/reload')
  async reloadScheduledTasks(): Promise<void> {
    return this.commands.execute(new ReloadScheduledTasks({}));
  }

  @Post('/tasks/:id/start')
  async startScheduledTask(@Param('id') id: string): Promise<void> {
    return this.commands.execute(new StartScheduledTask({ taskId: id }));
  }

  @Post('/tasks/:id/stop')
  async stopScheduledTask(@Param('id') id: string): Promise<void> {
    return this.commands.execute(new StopScheduledTask({ taskId: id }));
  }

  @Post('/tasks/:id/run')
  async runScheduledTask(@Param('id') id: string): Promise<void> {
    return this.commands.execute(new RunScheduledTask({ taskId: id }));
  }

  @Delete('/tasks/:id')
  async deleteScheduledTask(@Param('id') id: string): Promise<void> {
    return this.commands.execute(new RemoveScheduledTask({ taskId: id }));
  }
}
