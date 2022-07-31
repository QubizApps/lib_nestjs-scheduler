import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ScheduledTaskDto } from '../../read/dto/ScheduledTaskDto';
import { ScheduledTaskFinder } from '../../read/service/ScheduledTaskFinder';
import { FinderResult } from '../../read/service/types';
import { GetScheduledTasks } from './queries';

@QueryHandler(GetScheduledTasks)
export class GetScheduledTasksHandler implements IQueryHandler<GetScheduledTasks> {
  constructor(private readonly finder: ScheduledTaskFinder) {}

  async execute(query: GetScheduledTasks): Promise<FinderResult<ScheduledTaskDto[]>> {
    return this.finder.findAll({ ...query.payload });
  }
}
