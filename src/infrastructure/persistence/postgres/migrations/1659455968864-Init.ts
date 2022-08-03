import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { GlobalSchedulerModuleOptions } from '../../../../SchedulerModuleOptions';

export class Init1659455968864 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'scheduled_task',
        schema: GlobalSchedulerModuleOptions.storage.postgres.schema,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
            length: '255',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'task_type',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'interval',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'state',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'run_at',
            type: 'timestamp without time zone',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp without time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp without time zone',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'scheduled_task_name_index',
            columnNames: ['name'],
          },
          {
            name: 'scheduled_task_type_index',
            columnNames: ['type'],
          },
        ],
      }),
      true,
      true,
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(
      `${GlobalSchedulerModuleOptions.storage.postgres.schema}.scheduled_task`,
      true,
      true,
      true,
    );
    // we don't drop the schema, because we might no own it
    // this should not break migrations because schema is created only if not exists
    // it might require manual cleanup if you want to revert everything
  }
}
