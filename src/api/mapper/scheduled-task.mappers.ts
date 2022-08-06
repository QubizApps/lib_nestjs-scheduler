import { ScheduledTask, ScheduledTaskDto } from '../../index';
import { ScheduledTaskApiDto } from '../interface/ScheduledTaskApiDto';

export const readDtoToApiDto = (task: ScheduledTaskDto): ScheduledTaskApiDto | null => {
  if (!task) {
    return null;
  }

  return {
    ...task,
    id: task.id.toString(),
  };
};

export const domainToDto = (task: ScheduledTask): ScheduledTaskApiDto => {
  const state = task.state;

  return Object.assign<ScheduledTaskApiDto, ScheduledTaskApiDto>(new ScheduledTaskApiDto(), {
    id: task.id.toString(),
    name: state.name,
    type: state.type,
    taskType: task.taskType,
    interval: state.interval,
    params: state.params,
    tags: state.tags,
    status: state.status,
    runAt: state.runAt,
    completedAt: state.completedAt,
    output: state.output,
    error: state.error,
    createdAt: state.createdAt,
  });
};
