import { Type } from '@nestjs/common';

import { SchedulerService } from './core/service/SchedulerService';

export interface SchedulerModuleOptions {
  scheduler: {
    types: string[];
    implementation: Type<SchedulerService>;
  };
  api: {
    enabled: boolean;
    prefix: string;
  };
  storage: {
    type: 'postgres' | 'mongo';
    postgres: {
      connection: string;
      schema: string;
      migrationTable: string;
    };
  };
}

export class SchedulerModuleOptions {}
