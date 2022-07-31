import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { Uuid } from '@qubizapps/nestjs-commons';
import { CronJob } from 'cron';

import { RunScheduledTask } from '../../core/application/command/commands';
import { ScheduledTask } from '../../core/domain/model/ScheduledTask';
import { ScheduledTaskStatus } from '../../core/domain/model/types';
import { SchedulerService } from '../../core/service/SchedulerService';

@Injectable()
export class NestJsSchedulerService implements SchedulerService {
  constructor(
    private readonly registry: SchedulerRegistry,
    private readonly commands: CommandBus,
    private readonly logger: Logger,
  ) {}

  async add(task: ScheduledTask): Promise<void> {
    if (task.taskType === 'interval') {
      this.addInterval(task);
    } else {
      this.addCronJob(task);
    }
  }

  async start(task: ScheduledTask): Promise<void> {
    if (task.taskType === 'interval') {
      if (this.registry.doesExist('interval', task.id.toString())) {
        this.registry.deleteInterval(task.id.toString());
      }

      this.addInterval(task);
    } else {
      if (this.registry.doesExist('cron', task.id.toString())) {
        this.registry.getCronJob(task.id.toString()).start();
      } else {
        this.addCronJob(task);
      }
    }
  }

  async stop(task: ScheduledTask): Promise<void> {
    if (task.taskType === 'interval') {
      if (this.registry.doesExist('interval', task.id.toString())) {
        this.registry.deleteInterval(task.id.toString());
      }
    } else {
      if (this.registry.doesExist('cron', task.id.toString())) {
        const job = this.registry.getCronJob(task.id.toString());
        job.stop();
      }
    }
  }

  async remove(taskId: Uuid): Promise<void> {
    const id = taskId.toString();
    if (this.registry.doesExist('interval', id)) {
      this.registry.deleteInterval(id);
    }

    if (this.registry.doesExist('cron', id)) {
      this.registry.deleteCronJob(id);
    }
  }

  async clear(): Promise<void> {
    this.registry.getIntervals().forEach((interval) => this.registry.deleteInterval(interval));
    [...this.registry.getCronJobs().keys()].forEach((name) => this.registry.deleteCronJob(name));
  }

  private addInterval(task: ScheduledTask): void {
    // if task is not started we don't need to add an interval
    if (task.status !== ScheduledTaskStatus.Started) {
      return;
    }

    const interval = task.interval;
    const [, intervalValue] = interval.split(' ');

    const i = setInterval(async () => {
      await this.commands
        .execute(new RunScheduledTask({ taskId: task.id.toString() }))
        .catch((e) => {
          this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);
        });
    }, this.convertIntervalTime(intervalValue));

    this.registry.addInterval(task.id.toString(), i);
  }

  /**
   * @param task
   */
  private addCronJob(task: ScheduledTask): void {
    const interval = task.interval;

    let cronExpression = interval;
    if (interval.startsWith('@')) {
      cronExpression = this.convertInterval(interval);
    }

    const job = new CronJob(cronExpression, async () => {
      await this.commands
        .execute(new RunScheduledTask({ taskId: task.id.toString() }))
        .catch((e) => {
          this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);
        });
    });

    this.registry.addCronJob(task.id.toString(), job);

    if (task.status === ScheduledTaskStatus.Started) {
      job.start();
    }
  }

  private convertInterval(interval: string): string {
    switch (interval) {
      case '@hourly':
        return CronExpression.EVERY_HOUR;
      case '@daily':
        return CronExpression.EVERY_DAY_AT_MIDNIGHT;
      case '@weekly':
        return CronExpression.EVERY_WEEK;
      case '@monthly':
        return CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT;
      case '@yearly':
        return CronExpression.EVERY_YEAR;

      default:
        throw new Error(`Invalid interval expression: ${interval}`);
    }
  }

  private convertIntervalTime(interval: string): number {
    const match = interval.match(/^(\d+)(ns|us|µs|ms|s|m|h)$/);

    if (match) {
      const [, value, unit] = match;
      switch (unit) {
        case 'ns':
          return +value / 1000;
        case 'us':
          return +value / 1000000;
        case 'µs':
          return +value / 1000000000;
        case 'ms':
          return +value;
        case 's':
          return +value * 1000;
        case 'm':
          return +value * 1000 * 60;
        case 'h':
          return +value * 1000 * 60 * 60;

        default:
          throw new Error(`Invalid interval unit: ${unit}`);
      }
    } else {
      throw new Error(`Invalid interval value: ${interval}`);
    }
  }
}
