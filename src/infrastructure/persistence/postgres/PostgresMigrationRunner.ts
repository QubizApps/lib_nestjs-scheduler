import { Injectable } from '@nestjs/common';
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
  ) {}

  async run(): Promise<void> {
    const options = this.datasource.options as PostgresConnectionOptions;

    await this.datasource
      .createQueryRunner()
      .createSchema(this.moduleOptions.storage.postgres.schema);

    this.connection = new DataSource({
      ...options,
      schema: this.moduleOptions.storage.postgres.schema,
      migrations: [...migrations],
      migrationsTableName: this.moduleOptions.storage.postgres.migrationTable,
    });

    await this.connection.initialize();

    await this.connection.runMigrations();

    await this.connection.destroy();
  }
}
