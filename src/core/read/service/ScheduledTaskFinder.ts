import { ScheduledTaskStatus, ScheduledTaskType } from '../../domain/model/types';
import { ScheduledTaskDto } from '../dto/ScheduledTaskDto';
import { FinderResult } from './types';

export type ScheduledTaskFilters = {
  ids?: string[];
  types?: string[];
  taskTypes?: ScheduledTaskType[];
  statuses?: ScheduledTaskStatus[];
  offset?: number;
  limit?: number;
};

export interface ScheduledTaskFinder {
  findAll(filters: ScheduledTaskFilters): Promise<FinderResult<ScheduledTaskDto[]>>;
}

export class ScheduledTaskFinder {}
