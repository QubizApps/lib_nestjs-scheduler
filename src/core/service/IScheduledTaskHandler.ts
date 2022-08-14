import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTaskType } from '../domain/model/types';

export type ScheduledTaskHandle = {
  id: Uuid;
  name: string;
  type: string;
  taskType: ScheduledTaskType;
  interval: string;
  params: { [key: string]: any };

  stop: () => void;
  remove: () => void;

  changeInterval: (interval: string) => void;
  changeParams: (params: { [key: string]: any }) => void;
};

export interface IScheduledTaskHandler<T = any> {
  run(task: ScheduledTaskHandle): Promise<T>;
}
