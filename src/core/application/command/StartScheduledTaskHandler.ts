import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTaskRepository } from '../../domain/repository/ScheduledTaskRepository';
import { StartScheduledTask } from './commands';

@CommandHandler(StartScheduledTask)
export class StartScheduledTaskHandler implements ICommandHandler<StartScheduledTask> {
  constructor(private readonly repo: ScheduledTaskRepository, private readonly logger: Logger) {}

  async execute(command: StartScheduledTask): Promise<void> {
    const task = await this.repo.get(Uuid.fromString(command.payload.taskId));
    if (!task) {
      this.logger.error(
        `Task with id ${command.payload.taskId} does not exist`,
        null,
        this.constructor.name,
      );
      throw new BadRequestException(`Task with id ${command.payload.taskId} does not exist`);
    }

    try {
      task.start();
      await this.repo.save(task);
    } catch (e: any) {
      this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);
      throw new InternalServerErrorException(
        `Could not start scheduled task. Please try again later.`,
      );
    }
  }
}
