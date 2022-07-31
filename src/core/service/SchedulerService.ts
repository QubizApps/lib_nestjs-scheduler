import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTask } from '../domain/model/ScheduledTask';

export interface SchedulerService {
  add(task: ScheduledTask): Promise<void>;
  start(task: ScheduledTask): Promise<void>;
  stop(task: ScheduledTask): Promise<void>;
  remove(taskId: Uuid): Promise<void>;
  clear(): Promise<void>;
}

export class SchedulerService {}
