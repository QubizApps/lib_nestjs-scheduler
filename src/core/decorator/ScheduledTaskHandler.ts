import { SCHEDULED_TASK_HANDLER_METADATA } from '../../constants';

export const ScheduledTaskHandler = (type: string): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(SCHEDULED_TASK_HANDLER_METADATA, type, target);
  };
};
