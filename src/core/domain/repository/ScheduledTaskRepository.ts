import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTask } from '../model/ScheduledTask';

export interface ScheduledTaskRepository {
  get(id: Uuid): Promise<ScheduledTask | undefined>;
  getByName(name: string): Promise<ScheduledTask | undefined>;
  getAll(): Promise<ScheduledTask[]>;
  save(task: ScheduledTask): Promise<void>;
  remove(task: ScheduledTask): Promise<void>;
}

export class ScheduledTaskRepository {}
