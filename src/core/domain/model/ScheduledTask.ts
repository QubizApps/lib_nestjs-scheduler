import { AggregateRoot, AggregateRootState, Uuid } from '@qubizapps/nestjs-commons';

import {
  ScheduledTaskCompleted,
  ScheduledTaskCreated,
  ScheduledTaskFailed,
  ScheduledTaskIntervalChanged,
  ScheduledTaskRemoved,
  ScheduledTaskRun,
  ScheduledTaskStarted,
  ScheduledTaskStopped,
  ScheduledTaskTypeChanged,
} from '../event/events';
import { ScheduledTaskStatus, ScheduledTaskType } from './types';

export type ScheduledTaskState = AggregateRootState<Uuid> & {
  name: string;
  type: string;
  interval: string;
  tags: { [key: string]: string };
  params: { [key: string]: any };
  status: ScheduledTaskStatus;
  output?: {
    data: any;
  };
  error?: {
    message: string;
    stack?: string;
  };
  createdAt: Date;
  runAt?: Date;
  completedAt?: Date;
};

export class ScheduledTask extends AggregateRoot<Uuid, ScheduledTaskState> {
  static create(data: {
    id: Uuid;
    name: string;
    type: string;
    interval: string;
    params?: { [key: string]: any };
    tags?: { [key: string]: string };
    autostart?: boolean;
  }): ScheduledTask {
    const { id, name, type, interval } = data;

    const instance = ScheduledTask.fromState({
      id,
      name,
      type,
      interval,
      params: data.params || {},
      tags: data.tags || {},
      status: ScheduledTaskStatus.Stopped,
      createdAt: new Date(),
    });

    instance.apply(
      new ScheduledTaskCreated(instance, {
        type: data.type,
        taskType: instance.taskType,
        interval: data.interval,
        params: data.params || {},
      }),
    );

    if (data.autostart) {
      instance.start();
    }

    return instance;
  }

  start(): void {
    this._state.status = ScheduledTaskStatus.Started;

    this.apply(
      new ScheduledTaskStarted(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
      }),
    );
  }

  stop(): void {
    this._state.status = ScheduledTaskStatus.Stopped;

    this.apply(
      new ScheduledTaskStopped(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
      }),
    );
  }

  run(): void {
    this._state.runAt = new Date();
    this._state.completedAt = undefined;

    this.apply(
      new ScheduledTaskRun(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
      }),
    );
  }

  complete(): void {
    this._state.completedAt = new Date();

    this.apply(
      new ScheduledTaskCompleted(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
        output: this._state.output,
      }),
    );
  }

  failed(): void {
    this._state.completedAt = new Date();

    this.apply(
      new ScheduledTaskFailed(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
        error: this._state.error,
      }),
    );
  }

  remove(): void {
    this.apply(
      new ScheduledTaskRemoved(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
      }),
    );
  }

  set output(value: any) {
    if (!this._state.output) {
      this._state.output = {
        data: value,
      };
    } else {
      this._state.output.data = value;
    }

    this._state.error = undefined;
  }

  set error(err: string | Error) {
    if (!this._state.error) {
      this._state.error = {
        message: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack?.toString() : undefined,
      };
    } else {
      this._state.error.message = err instanceof Error ? err.message : err;
      this._state.error.stack = err instanceof Error ? err.stack?.toString() : undefined;
    }

    this._state.output = undefined;
  }

  get name(): string {
    return this._state.name;
  }
  set name(value: string) {
    this._state.name = value;
  }

  get type(): string {
    return this._state.type;
  }
  set type(value: string) {
    this._state.type = value;

    this.apply(
      new ScheduledTaskTypeChanged(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
      }),
    );
  }

  get interval(): string {
    return this._state.interval;
  }
  set interval(value: string) {
    if (value === this._state.interval) {
      return;
    }

    this._state.interval = value;

    this.apply(
      new ScheduledTaskIntervalChanged(this, {
        type: this._state.type,
        taskType: this.taskType,
        interval: this._state.interval,
        params: this._state.params,
      }),
    );
  }

  get params(): { [key: string]: any } {
    return this._state.params;
  }
  set params(value: { [key: string]: any }) {
    this._state.params = value;
  }

  get tags(): { [key: string]: string } {
    return this._state.tags;
  }
  set tags(value: { [key: string]: string }) {
    this._state.tags = value;
  }

  get status(): ScheduledTaskStatus {
    return this._state.status;
  }

  get createdAt(): Date {
    return this._state.createdAt;
  }

  get taskType(): ScheduledTaskType {
    return this._state.interval.startsWith('@every') ? 'interval' : 'cronjob';
  }
}
