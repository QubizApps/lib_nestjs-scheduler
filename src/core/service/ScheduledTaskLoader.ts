import { Injectable, Logger } from '@nestjs/common';

import { ScheduledTaskRepository } from '../domain/repository/ScheduledTaskRepository';
import { SchedulerService } from './SchedulerService';

@Injectable()
export class ScheduledTaskLoader {
  constructor(
    private readonly repo: ScheduledTaskRepository,
    private readonly scheduler: SchedulerService,
    private readonly logger: Logger,
  ) {}

  async load(): Promise<void> {
    const tasks = await this.repo.getAll();

    for (const task of tasks) {
      this.scheduler.add(task);
      this.logger.log(`Loaded scheduled task "${task.name}"`, this.constructor.name);
    }
  }

  async reload(): Promise<void> {
    this.scheduler.clear();
    await this.load();
  }
}
