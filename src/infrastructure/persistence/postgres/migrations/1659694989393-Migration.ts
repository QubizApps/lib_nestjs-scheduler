import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class Migration1659694989393 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      new Table({ name: 'scheduled_task' }),
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        default: `'{}'::jsonb`,
      }),
    );

    await queryRunner.query(
      `CREATE INDEX scheduled_task_tags_idx ON scheduled_task USING gin(tags)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('scheduled_task', 'scheduled_task_tags_idx');
    await queryRunner.dropColumn('scheduled_task', 'tags');
  }
}
