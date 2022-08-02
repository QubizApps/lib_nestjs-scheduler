import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

import { SchedulerModuleOptions } from '../../../SchedulerModuleOptions';
import { MigrationRunner } from '../MigrationRunner';
import { migrations } from './migrations/index';

@Injectable()
export class PostgresMigrationRunner implements MigrationRunner {
  private connection!: DataSource;

  constructor(
    private readonly datasource: DataSource,
    private readonly moduleOptions: SchedulerModuleOptions,
    private readonly logger: Logger,
  ) {}

  async run(): Promise<void> {
    const options = this.datasource.options as PostgresConnectionOptions;

    // clone the original default db connection
    // and setup only local migration classes to be run through it
    // package will still use default connection throughout
    this.connection = new DataSource({
      ...options,
      migrations: [...migrations],
      migrationsTableName: this.moduleOptions.storage.postgres.migrationTable,
    });

    await this.connection.initialize();

    this.logger.log(`Running scheduler module migrations`, 'SchedulerModule');
    await this.connection.runMigrations({
      transaction: 'all',
    });

    await this.connection.destroy();
  }
}
