import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddTaskTags1659694989393 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection.driver.options as any;

    await queryRunner.addColumn(
      new Table({ name: 'scheduled_task', schema }),
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        default: `'{}'::jsonb`,
      }),
    );

    await queryRunner.query(
      `CREATE INDEX scheduled_task_tags_idx ON ${schema}.scheduled_task USING gin(tags)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection.driver.options as any;

    await queryRunner.dropIndex(
      new Table({ name: 'scheduled_task', schema }),
      'scheduled_task_tags_idx',
    );

    await queryRunner.dropColumn(new Table({ name: 'scheduled_task', schema }), 'tags');
  }
}
