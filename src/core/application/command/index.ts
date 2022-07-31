import { AddScheduledTaskHandler } from './AddScheduledTaskHandler';
import { ReloadScheduledTasksHandler } from './ReloadScheduledTasksHandler';
import { RemoveScheduledTaskHandler } from './RemoveScheduledTaskHandler';
import { RunScheduledTaskHandler } from './RunScheduledTaskHandler';
import { StartScheduledTaskHandler } from './StartScheduledTaskHandler';
import { StopScheduledTaskHandler } from './StopScheduledTaskHandler';

export const commandHandlers = [
  AddScheduledTaskHandler,
  ReloadScheduledTasksHandler,
  RemoveScheduledTaskHandler,
  StartScheduledTaskHandler,
  StopScheduledTaskHandler,
  RunScheduledTaskHandler,
];
