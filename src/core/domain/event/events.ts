import { DomainEvent } from '@qubizapps/nestjs-commons';

import { ScheduledTask } from '../model/ScheduledTask';
import { ScheduledTaskType } from '../model/types';

type ScheduledTaskEventBasePayload = {
  type: string;
  taskType: ScheduledTaskType;
  interval: string;
  params: { [key: string]: any };
};

export class ScheduledTaskCreated extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload
> {}

export class ScheduledTaskStarted extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload
> {}

export class ScheduledTaskStopped extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload
> {}

export class ScheduledTaskRemoved extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload
> {}

export class ScheduledTaskRun extends DomainEvent<ScheduledTask, ScheduledTaskEventBasePayload> {}

export class ScheduledTaskCompleted extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload & {
    output?: { data: any };
  }
> {}

export class ScheduledTaskFailed extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload & {
    error?: { message: string; stack?: string };
  }
> {}

export class ScheduledTaskIntervalChanged extends DomainEvent<
  ScheduledTask,
  ScheduledTaskEventBasePayload
> {}
