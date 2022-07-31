import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTaskRepository } from '../../domain/repository/ScheduledTaskRepository';
import { RunScheduledTask } from './commands';

@CommandHandler(RunScheduledTask)
export class RunScheduledTaskHandler implements ICommandHandler<RunScheduledTask> {
  constructor(private readonly repo: ScheduledTaskRepository, private readonly logger: Logger) {}

  async execute(command: RunScheduledTask): Promise<void> {
    const task = await this.repo.get(Uuid.fromString(command.payload.taskId));
    if (!task) {
      this.logger.error(`Task ${command.payload.taskId} not found`, null, this.constructor.name);
      return;
    }

    task.run();

    try {
      await this.repo.save(task);
    } catch (e: any) {
      this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);
    }
  }
}
