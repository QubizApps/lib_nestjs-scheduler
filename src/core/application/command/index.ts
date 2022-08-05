import { AddScheduledTaskHandler } from './AddScheduledTaskHandler';
import { ReloadScheduledTasksHandler } from './ReloadScheduledTasksHandler';
import { RemoveScheduledTaskHandler } from './RemoveScheduledTaskHandler';
import { RunScheduledTaskHandler } from './RunScheduledTaskHandler';
import { StartScheduledTaskHandler } from './StartScheduledTaskHandler';
import { StopScheduledTaskHandler } from './StopScheduledTaskHandler';
import { UpdateScheduledTaskHandler } from './UpdateScheduledTaskHandler';

export const commandHandlers = [
  AddScheduledTaskHandler,
  UpdateScheduledTaskHandler,
  ReloadScheduledTasksHandler,
  RemoveScheduledTaskHandler,
  StartScheduledTaskHandler,
  StopScheduledTaskHandler,
  RunScheduledTaskHandler,
];
