import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTaskType } from '../domain/model/types';

export type ScheduledTaskHandle = {
  id: Uuid;
  name: string;
  type: string;
  taskType: ScheduledTaskType;
  params: { [key: string]: any };
  stop: () => void;
};

export interface IScheduledTaskHandler<T = any> {
  run(task: ScheduledTaskHandle): Promise<T>;
}
