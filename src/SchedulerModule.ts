import { DynamicModule, Logger, Module, OnModuleInit, Provider, Type } from '@nestjs/common';
import { ModuleRef, ModulesContainer, RouterModule } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module as NestModule } from '@nestjs/core/injector/module';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiModule } from './api/ApiModule';
import { SCHEDULED_TASK_HANDLER_METADATA } from './constants';
import { commandHandlers } from './core/application/command/index';
import { queryHandlers } from './core/application/query/index';
import { sagas } from './core/application/saga/index';
import { ScheduledTaskRepository } from './core/domain/repository/ScheduledTaskRepository';
import { ScheduledTaskFinder } from './core/read/service/ScheduledTaskFinder';
import { IScheduledTaskHandler } from './core/service/IScheduledTaskHandler';
import { ScheduledTaskExecutor } from './core/service/ScheduledTaskExecutor';
import { ScheduledTaskLoader } from './core/service/ScheduledTaskLoader';
import { SchedulerService } from './core/service/SchedulerService';
import { MigrationRunner } from './infrastructure/persistence/MigrationRunner';
import { ScheduledTaskPostgresDao } from './infrastructure/persistence/postgres/dao/ScheduledTaskPostgresDao';
import { PostgresMigrationRunner } from './infrastructure/persistence/postgres/PostgresMigrationRunner';
import { ScheduledTaskPostgresRepository } from './infrastructure/persistence/postgres/repository/ScheduledTaskPostgresRepository';
import { ScheduledTaskPostgresFinder } from './infrastructure/persistence/postgres/service/ScheduledTaskPostgresFinder';
import { GlobalSchedulerModuleOptions, SchedulerModuleOptions } from './SchedulerModuleOptions';
import { DeepPartial } from './types';

@Module({})
export class SchedulerModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  static forRoot(
    _options?: DeepPartial<SchedulerModuleOptions> & {
      scheduler?: { implementation?: Type<SchedulerService> };
    },
  ): DynamicModule {
    const options: SchedulerModuleOptions = {
      api: {
        enabled: _options?.api?.enabled ?? GlobalSchedulerModuleOptions.api.enabled,
        prefix: _options?.api?.prefix ?? GlobalSchedulerModuleOptions.api.prefix,
      },
      scheduler: {
        implementation:
          _options?.scheduler?.implementation ??
          GlobalSchedulerModuleOptions.scheduler.implementation,
        types: _options?.scheduler?.types ?? GlobalSchedulerModuleOptions.scheduler.types,
      },
      storage: {
        type: _options?.storage?.type ?? GlobalSchedulerModuleOptions.storage.type,
        postgres: {
          schema:
            _options?.storage?.postgres?.schema ??
            GlobalSchedulerModuleOptions.storage.postgres.schema,
          migrationTable:
            _options?.storage?.postgres?.migrationTable ??
            GlobalSchedulerModuleOptions.storage.postgres.migrationTable,
        },
      },
    };

    GlobalSchedulerModuleOptions.api = options.api;
    GlobalSchedulerModuleOptions.scheduler = options.scheduler;
    GlobalSchedulerModuleOptions.storage = options.storage;

    if (options.storage.type === 'mongo') {
      throw new Error('Mongo storage is not supported yet');
    }

    const imports = [CqrsModule, ScheduleModule.forRoot()];
    let providers: Provider[] = [
      Logger,
      {
        provide: SchedulerModuleOptions,
        useValue: options,
      },
      ...commandHandlers,
      ...queryHandlers,
      ...sagas,
      ScheduledTaskExecutor,
      ScheduledTaskLoader,
      {
        provide: SchedulerService,
        useClass: options.scheduler.implementation,
      },
    ];

    if (options.api.enabled) {
      imports.push(ApiModule.forRoot());
      imports.push(RouterModule.register([{ path: options.api.prefix, module: ApiModule }]));
    }

    if (options.storage.type === 'postgres') {
      imports.push(
        TypeOrmModule.forFeature([ScheduledTaskPostgresDao], {
          name: 'default',
          type: 'postgres',
          schema: options.storage.postgres.schema,
        }),
      );
      providers = providers.concat([
        {
          provide: ScheduledTaskRepository,
          useClass: ScheduledTaskPostgresRepository,
        },
        {
          provide: ScheduledTaskFinder,
          useClass: ScheduledTaskPostgresFinder,
        },
        {
          provide: MigrationRunner,
          useClass: PostgresMigrationRunner,
        },
      ]);
    }

    return {
      module: SchedulerModule,
      global: true,
      imports,
      providers,
      exports: [
        SchedulerModuleOptions,
        ScheduledTaskRepository,
        ScheduledTaskFinder,
        SchedulerService,
      ],
    };
  }

  async onModuleInit() {
    const migrationRunner = this.moduleRef.get(MigrationRunner);
    await migrationRunner.run();

    const taskHandlers = this.loadTaskHandlers();

    // register decorated classes as task handlers(by type)
    const taskExecutor = this.moduleRef.get(ScheduledTaskExecutor);
    taskExecutor.register(taskHandlers);

    // load tasks from database
    const taskLoader = this.moduleRef.get(ScheduledTaskLoader);
    await taskLoader.load();
  }

  private loadTaskHandlers() {
    const modules = [...this.modulesContainer.values()];
    const taskHandlers = this.flatMap<IScheduledTaskHandler>(modules, (instance) =>
      this.filterProvider(instance, SCHEDULED_TASK_HANDLER_METADATA),
    );

    return taskHandlers;
  }

  private flatMap<T>(
    modules: NestModule[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    const items = modules
      .map((module) => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((element) => !!element) as Type<T>[];
  }

  private filterProvider(wrapper: InstanceWrapper, metadataKey: string): Type<any> | undefined {
    const { instance } = wrapper;

    if (!instance) {
      return undefined;
    }

    return this.extractMetadata(instance, metadataKey);
  }

  private extractMetadata(
    instance: Record<string, any>,
    metadataKey: string,
  ): Type<any> | undefined {
    if (!instance.constructor) {
      return;
    }

    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);

    return metadata ? (instance.constructor as Type<any>) : undefined;
  }
}
