import { Command } from '@qubizapps/nestjs-commons';

export class AddScheduledTask extends Command<{
  name: string;
  type: string;
  interval: string;
  params: { [key: string]: any };
  autostart?: boolean;
}> {}

export class StartScheduledTask extends Command<{
  taskId: string;
}> {}

export class StopScheduledTask extends Command<{
  taskId: string;
}> {}

export class RemoveScheduledTask extends Command<{
  taskId: string;
}> {}

export class RunScheduledTask extends Command<{
  taskId: string;
}> {}

export class ReloadScheduledTasks extends Command<any> {}
