import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Uuid } from '@qubizapps/nestjs-commons';

import { ScheduledTask } from '../../domain/model/ScheduledTask';
import { ScheduledTaskRepository } from '../../domain/repository/ScheduledTaskRepository';
import { AddScheduledTask } from './commands';

@CommandHandler(AddScheduledTask)
export class AddScheduledTaskHandler implements ICommandHandler<AddScheduledTask> {
  constructor(private readonly repo: ScheduledTaskRepository, private readonly logger: Logger) {}

  async execute(command: AddScheduledTask): Promise<ScheduledTask> {
    const existing = await this.repo.getByName(command.payload.name);
    if (existing) {
      throw new BadRequestException(`Task with name ${command.payload.name} already exists`);
    }

    const task = ScheduledTask.create({
      id: Uuid.generate(),
      name: command.payload.name,
      type: command.payload.type,
      interval: command.payload.interval,
      params: command.payload.params,
      autostart: command.payload.autostart ?? false,
    });

    try {
      await this.repo.save(task);

      return task;
    } catch (e: any) {
      this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);

      throw new InternalServerErrorException(
        'Could not save scheduled task. Please try again later.',
      );
    }
  }
}
