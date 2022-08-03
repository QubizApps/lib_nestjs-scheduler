import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'scheduled_task' })
export class ScheduledTaskPostgresDao {
  @PrimaryColumn({ name: 'id', type: 'uuid' })
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  type!: string;

  @Column({ name: 'task_type' })
  taskType!: string;

  @Column()
  interval!: string;

  @Column({ type: 'jsonb' })
  state!: { [key: string]: any };

  @Column()
  status!: string;

  @Column({ name: 'run_at', type: 'timestamp without time zone', nullable: true })
  runAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp without time zone', nullable: true })
  completedAt?: Date;

  @Column({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt!: Date;
}
