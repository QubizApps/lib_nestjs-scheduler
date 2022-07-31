import { Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Uuid } from '@qubizapps/nestjs-commons';

import { SCHEDULED_TASK_HANDLER_METADATA } from '../../constants';
import { ScheduledTaskRepository } from '../domain/repository/ScheduledTaskRepository';
import { IScheduledTaskHandler } from './IScheduledTaskHandler';

@Injectable()
export class ScheduledTaskExecutor {
  private handlers: Map<string, IScheduledTaskHandler>;

  constructor(
    private readonly repo: ScheduledTaskRepository,
    private readonly moduleRef: ModuleRef,
    private readonly logger: Logger,
  ) {
    this.handlers = new Map();
  }

  register(handlers: Type<IScheduledTaskHandler>[]) {
    handlers.forEach((handler) => {
      const type = Reflect.getMetadata(SCHEDULED_TASK_HANDLER_METADATA, handler);

      const instance = this.moduleRef.get(handler, { strict: false });
      if (!instance) {
        return;
      }

      this.handlers.set(type, instance);
    });
  }

  async execute(taskId: Uuid): Promise<any> {
    const task = await this.repo.get(taskId);
    if (!task) {
      this.logger.error(`Task ${taskId} not found`, this.constructor.name);
      return;
    }

    const handler = this.handlers.get(task.type);
    if (!handler) {
      this.logger.error(`Task handler for ${task.type} not found`, this.constructor.name);

      task.error = `Task handler for ${task.type} not found`;
      task.complete();
    } else {
      try {
        const output = await handler.run({
          id: task.id,
          name: task.name,
          type: task.type,
          taskType: task.taskType,
          params: task.params,
          stop: task.stop.bind(task),
        });

        task.output = output;
      } catch (e: any) {
        task.error = e;
      } finally {
        task.complete();
      }
    }

    try {
      await this.repo.save(task);
    } catch (e: any) {
      this.logger.error(e.message || e, e.stack?.toString(), this.constructor.name);
    }
  }
}
