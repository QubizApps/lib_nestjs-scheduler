import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ScheduledTaskRepository } from '../../domain/repository/ScheduledTaskRepository';
import { UpdateScheduledTask } from './commands';

@CommandHandler(UpdateScheduledTask)
export class UpdateScheduledTaskHandler implements ICommandHandler<UpdateScheduledTask> {
  constructor(private readonly repo: ScheduledTaskRepository, private readonly logger: Logger) {}

  async execute(command: UpdateScheduledTask): Promise<void> {
    const task = await this.repo.get(command.payload.id);
    if (!task) {
      throw new NotFoundException(`Task with id ${command.payload.id.toString()} not found`);
    }

    if (command.payload.name && command.payload.name !== task.name) {
      const exists = await this.repo.getByName(command.payload.name);
      if (exists) {
        throw new BadRequestException(`Task with name ${command.payload.name} already exists`);
      }
    }

    task.name = command.payload.name || task.name;
    task.interval = command.payload.interval || task.interval;
    task.params = command.payload.params || task.params;
    task.tags = command.payload.tags || task.tags;

    try {
      await this.repo.save(task);
    } catch (e: any) {
      this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);

      throw new InternalServerErrorException(
        'Could not save scheduled task. Please try again later.',
      );
    }
  }
}
