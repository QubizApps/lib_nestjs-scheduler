import { DomainEvent } from '@qubizapps/nestjs-commons';

import { ScheduledTaskType } from '../model/types';

export class ScheduledTaskCreated extends DomainEvent<{
  taskId: string;
  name: string;
  type: string;
  interval: string;
  params: { [key: string]: any };
}> {}

export class ScheduledTaskStarted extends DomainEvent<{
  taskId: string;
}> {}

export class ScheduledTaskStopped extends DomainEvent<{
  taskId: string;
}> {}

export class ScheduledTaskRemoved extends DomainEvent<{
  taskId: string;
  name: string;
  type: string;
  taskType: ScheduledTaskType;
}> {}

export class ScheduledTaskRun extends DomainEvent<{
  taskId: string;
  name: string;
  type: string;
  params: { [key: string]: any };
}> {}

export class ScheduledTaskCompleted extends DomainEvent<{
  taskId: string;
}> {}
