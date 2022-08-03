import { EntitySchema } from 'typeorm';

export class ScheduledTaskPostgresDao {
  id!: string;
  name!: string;
  type!: string;
  taskType!: string;
  interval!: string;
  state!: { [key: string]: any };
  status!: string;
  runAt?: Date;
  completedAt?: Date;
  createdAt!: Date;
}

export const ScheduledTaskPostgresEntitySchema = (schema: string) =>
  new EntitySchema<ScheduledTaskPostgresDao>({
    name: 'scheduled_task',
    schema,
    columns: {
      id: {
        primary: true,
        type: 'uuid',
      },
      name: {
        type: 'varchar',
        unique: true,
        length: 255,
      },
      type: {
        type: 'varchar',
        length: 255,
      },
      taskType: {
        name: 'task_type',
        type: 'varchar',
        length: 20,
      },
      interval: {
        type: 'varchar',
        length: 255,
      },
      state: {
        type: 'jsonb',
      },
      status: {
        type: 'varchar',
        length: 20,
      },
      runAt: {
        name: 'run_at',
        type: 'timestamp without time zone',
        nullable: true,
      },
      completedAt: {
        name: 'completed_at',
        type: 'timestamp without time zone',
        nullable: true,
      },
      createdAt: {
        name: 'created_at',
        type: 'timestamp without time zone',
      },
    },
  });
