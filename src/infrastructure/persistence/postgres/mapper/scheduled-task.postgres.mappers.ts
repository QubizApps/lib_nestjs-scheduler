import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTask, ScheduledTaskState } from '../../../../core/domain/model/ScheduledTask';
import { ScheduledTaskStatus, ScheduledTaskType } from '../../../../core/domain/model/types';
import { ScheduledTaskDto } from '../../../../core/read/dto/ScheduledTaskDto';
import { ScheduledTaskPostgresDao } from '../dao/ScheduledTaskPostgresDao';

export const daoToReadDto = (task: ScheduledTaskPostgresDao): ScheduledTaskDto => {
  return {
    id: Uuid.fromString(task.id),
    name: task.name,
    type: task.type,
    taskType: task.taskType as ScheduledTaskType,
    interval: task.interval,
    status: task.status as ScheduledTaskStatus,
    params: task.state.params,
    tags: task.state.tags,
    output: task.state.output,
    error: task.state.error,
    runAt: task.runAt,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
  };
};

export const daoToDomain = (dao: ScheduledTaskPostgresDao): ScheduledTask => {
  return ScheduledTask.fromState({
    ...(dao.state as ScheduledTaskState),
    id: Uuid.fromString(dao.id),
  });
};

export const domainToDao = (task: ScheduledTask): ScheduledTaskPostgresDao => {
  const state = task.state;

  return Object.assign<ScheduledTaskPostgresDao, ScheduledTaskPostgresDao>(
    new ScheduledTaskPostgresDao(),
    {
      id: task.id.toString(),
      name: state.name,
      type: state.type,
      taskType: task.taskType,
      interval: state.interval,
      tags: state.tags,
      state: state,
      status: state.status,
      runAt: state.runAt,
      completedAt: state.completedAt,
      createdAt: state.createdAt,
    },
  );
};
