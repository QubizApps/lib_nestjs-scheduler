import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTaskStatus, ScheduledTaskType } from '../../domain/model/types';

export type ScheduledTaskDto = {
  id: Uuid;
  name: string;
  type: string;
  taskType: ScheduledTaskType;
  interval: string;
  status: ScheduledTaskStatus;
  params: { [key: string]: any };
  tags: { [key: string]: string };
  output?: {
    data: { [key: string]: any };
  };
  error?: {
    message: string;
    stack?: string;
  };
  runAt?: Date;
  completedAt?: Date;
  createdAt: Date;
};
