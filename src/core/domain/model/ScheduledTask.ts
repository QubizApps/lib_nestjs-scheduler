import { AggregateRoot, AggregateRootState, Uuid } from '@qubizapps/nestjs-commons';

import {
  ScheduledTaskCompleted,
  ScheduledTaskCreated,
  ScheduledTaskRemoved,
  ScheduledTaskRun,
  ScheduledTaskStarted,
  ScheduledTaskStopped,
} from '../event/events';
import { ScheduledTaskStatus, ScheduledTaskType } from './types';

export type ScheduledTaskState = AggregateRootState<Uuid> & {
  name: string;
  type: string;
  interval: string;
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
    params: { [key: string]: any };
    autostart: boolean;
  }): ScheduledTask {
    const instance = ScheduledTask.fromState({
      ...data,
      status: ScheduledTaskStatus.Stopped,
      createdAt: new Date(),
    });

    instance.apply(
      new ScheduledTaskCreated(instance, {
        taskId: data.id.toString(),
        name: data.name,
        interval: data.interval,
        params: data.params,
        type: data.type,
      }),
    );

    if (data.autostart) {
      instance.start();
    }

    return instance;
  }

  start(): void {
    this._state.status = ScheduledTaskStatus.Started;

    this.apply(new ScheduledTaskStarted(this, { taskId: this.id.toString() }));
  }

  stop(): void {
    this._state.status = ScheduledTaskStatus.Stopped;

    this.apply(new ScheduledTaskStopped(this, { taskId: this.id.toString() }));
  }

  run(): void {
    this._state.runAt = new Date();
    this._state.completedAt = undefined;

    this.apply(
      new ScheduledTaskRun(this, {
        taskId: this.id.toString(),
        name: this._state.name,
        type: this._state.type,
        params: this._state.params,
      }),
    );
  }

  complete(): void {
    this._state.completedAt = new Date();

    this.apply(new ScheduledTaskCompleted(this, { taskId: this.id.toString() }));
  }

  remove(): void {
    this.apply(
      new ScheduledTaskRemoved(this, {
        taskId: this.id.toString(),
        name: this._state.name,
        type: this._state.type,
        taskType: this.taskType,
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

  get type(): string {
    return this._state.type;
  }

  get interval(): string {
    return this._state.interval;
  }

  get params(): { [key: string]: any } {
    return this._state.params;
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
