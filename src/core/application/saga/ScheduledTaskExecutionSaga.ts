import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Uuid } from '@qubizapps/nestjs-commons';
import { catchError, concatMap, Observable } from 'rxjs';

import { ScheduledTaskRun } from '../../domain/event/events';
import { ScheduledTaskExecutor } from '../../service/ScheduledTaskExecutor';

@Injectable()
export class ScheduledTaskExecutionSaga {
  constructor(private readonly executor: ScheduledTaskExecutor, private readonly logger: Logger) {}

  @Saga()
  runTask = ($events: Observable<any>): Observable<any> =>
    $events.pipe(
      ofType(ScheduledTaskRun),
      concatMap((event) => this.executor.execute(Uuid.fromString(event.payload.taskId))),
      catchError((err) => {
        this.logger.error(err.message || err, err.stack?.toString(), this.constructor.name);
        return [];
      }),
    );
}
