import { Type } from '@nestjs/common';

import { SchedulerService } from './core/service/SchedulerService';
import { NestJsSchedulerService } from './infrastructure/service/NestJsSchedulerService';

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
      schema: string;
    };
  };
}

export class SchedulerModuleOptions {}

export const DefaultSchedulerModuleOptions: SchedulerModuleOptions = {
  scheduler: {
    types: [],
    implementation: NestJsSchedulerService,
  },
  api: {
    enabled: true,
    prefix: '',
  },
  storage: {
    type: 'postgres',
    postgres: {
      schema: 'public',
    },
  },
};
