import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

import { SchedulerModuleOptions } from '../../../SchedulerModuleOptions';
import { MigrationRunner } from '../MigrationRunner';
import { migrations } from './migrations/index';

@Injectable()
export class PostgresMigrationRunner implements MigrationRunner {
  private readonly connection: DataSource;

  constructor(
    datasource: DataSource,
    private readonly moduleOptions: SchedulerModuleOptions,
    private readonly logger: Logger,
  ) {
    const options = datasource.options as PostgresConnectionOptions;

    // clone the original default db connection
    // and setup only local migration classes to be run through it
    // package will still use default connection throughout
    this.connection = new DataSource({
      ...options,
      migrations: [...migrations],
      migrationsTableName: 'scheduler_migrations',
      schema: moduleOptions.storage.postgres.schema,
    });
  }

  async run(): Promise<void> {
    this.logger.log(`Running scheduler module migrations`, 'SchedulerModule');
    await this.connection.runMigrations({
      transaction: 'all',
    });
  }
}
