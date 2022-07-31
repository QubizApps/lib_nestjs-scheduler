import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ScheduledTaskLoader } from '../../service/ScheduledTaskLoader';
import { ReloadScheduledTasks } from './commands';

@CommandHandler(ReloadScheduledTasks)
export class ReloadScheduledTasksHandler implements ICommandHandler<ReloadScheduledTasks> {
  constructor(private readonly loader: ScheduledTaskLoader) {}

  async execute(): Promise<any> {
    await this.loader.reload();
  }
}
