import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { catchError, concatMap, filter, map, merge, Observable } from 'rxjs';

import {
  ScheduledTaskCreated,
  ScheduledTaskIntervalChanged,
  ScheduledTaskRemoved,
  ScheduledTaskStarted,
  ScheduledTaskStopped,
  ScheduledTaskTypeChanged,
} from '../../domain/event/events';
import { ScheduledTask } from '../../domain/model/ScheduledTask';
import { ScheduledTaskRepository } from '../../domain/repository/ScheduledTaskRepository';
import { SchedulerService } from '../../service/SchedulerService';

@Injectable()
export class ScheduledTaskSaga {
  constructor(
    private readonly repo: ScheduledTaskRepository,
    private readonly scheduler: SchedulerService,
    private readonly logger: Logger,
  ) {}

  @Saga()
  scheduleTasks = ($events: Observable<any>): Observable<any> =>
    merge(
      $events.pipe(ofType(ScheduledTaskCreated)),
      $events.pipe(ofType(ScheduledTaskStarted)),
      $events.pipe(ofType(ScheduledTaskStopped)),
      $events.pipe(ofType(ScheduledTaskIntervalChanged)),
      $events.pipe(ofType(ScheduledTaskTypeChanged)),
    ).pipe(
      concatMap<
        | ScheduledTaskCreated
        | ScheduledTaskStarted
        | ScheduledTaskStopped
        | ScheduledTaskIntervalChanged
        | ScheduledTaskTypeChanged,
        Promise<
          [
            (
              | ScheduledTaskCreated
              | ScheduledTaskStarted
              | ScheduledTaskStopped
              | ScheduledTaskIntervalChanged
              | ScheduledTaskTypeChanged
            ),
            ScheduledTask | undefined,
          ]
        >
      >((event) => this.repo.get(event.payload.aggregateId).then((task) => [event, task])),
      filter(([, task]) => !!task),
      map(([event, task]) => {
        task = task as ScheduledTask;

        switch (event.constructor) {
          case ScheduledTaskCreated:
            this.scheduler.add(task);
            break;

          case ScheduledTaskStarted:
            this.scheduler.start(task);
            break;

          case ScheduledTaskStopped:
            this.scheduler.stop(task);
            break;

          case ScheduledTaskIntervalChanged:
          case ScheduledTaskTypeChanged:
            // reload task
            this.scheduler.remove(task.id);
            this.scheduler.add(task);
            break;
        }
      }),
      catchError((err) => {
        this.logger.error(err.message || err, err.stack?.toString(), this.constructor.name);
        return [];
      }),
    );

  removeTask = ($events: Observable<any>): Observable<any> =>
    $events.pipe(
      ofType(ScheduledTaskRemoved),
      map((event) => {
        this.scheduler.remove(event.payload.aggregateId);
      }),
      catchError((err) => {
        this.logger.error(err.message || err, err.stack?.toString(), this.constructor.name);
        return [];
      }),
    );
}
