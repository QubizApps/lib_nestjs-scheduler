import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SchedulerController } from './controller/SchedulerController';

@Module({})
export class ApiModule {
  static forRoot(): DynamicModule {
    return {
      module: ApiModule,
      imports: [CqrsModule],
      controllers: [SchedulerController],
    };
  }
}
