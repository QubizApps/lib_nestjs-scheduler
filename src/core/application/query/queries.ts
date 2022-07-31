import { Query } from '@qubizapps/nestjs-commons';

import { ScheduledTaskStatus, ScheduledTaskType } from '../../domain/model/types';

export class GetScheduledTasks extends Query<{
  ids?: string[];
  types?: string[];
  taskTypes?: ScheduledTaskType[];
  statuses?: ScheduledTaskStatus[];
  offset?: number;
  limit?: number;
}> {}
