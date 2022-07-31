export enum ScheduledTaskStatus {
  Started = 'started',
  Stopped = 'stopped',
}

export type ScheduledTaskType = 'interval' | 'cronjob';
