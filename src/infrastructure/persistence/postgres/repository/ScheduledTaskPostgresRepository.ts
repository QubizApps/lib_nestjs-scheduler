import { EventPublisher } from '@nestjs/cqrs';
import { Uuid } from '@qubizapps/nestjs-commons';
import { DataSource, Repository } from 'typeorm';

import { ScheduledTask } from '../../../../core/domain/model/ScheduledTask';
import { ScheduledTaskRepository } from '../../../../core/domain/repository/ScheduledTaskRepository';
import { SchedulerModuleOptions } from '../../../../SchedulerModuleOptions';
import {
  ScheduledTaskPostgresDao,
  ScheduledTaskPostgresEntitySchema,
} from '../dao/ScheduledTaskPostgresDao';
import { ScheduledTaskPostgresMapper } from '../mapper/index';

export class ScheduledTaskPostgresRepository implements ScheduledTaskRepository {
  private repo: Repository<ScheduledTaskPostgresDao>;

  constructor(
    private readonly eventPub: EventPublisher,
    private readonly connection: DataSource,
    private readonly moduleOptions: SchedulerModuleOptions,
  ) {
    this.repo = this.connection.getRepository<ScheduledTaskPostgresDao>(
      ScheduledTaskPostgresEntitySchema(this.moduleOptions.storage.postgres.schema),
    );
  }

  async get(id: Uuid): Promise<ScheduledTask | undefined> {
    return this.repo
      .findOneBy({ id: id.toString() })
      .then((t) => (!!t ? ScheduledTaskPostgresMapper.daoToDomain(t) : undefined));
  }

  async getByName(name: string): Promise<ScheduledTask | undefined> {
    return this.repo
      .findOneBy({ name })
      .then((t) => (!!t ? ScheduledTaskPostgresMapper.daoToDomain(t) : undefined));
  }

  async getAll(): Promise<ScheduledTask[]> {
    return this.repo.find().then((tasks) => tasks.map(ScheduledTaskPostgresMapper.daoToDomain));
  }

  async save(task: ScheduledTask): Promise<void> {
    this.eventPub.mergeObjectContext(task);

    const dao = ScheduledTaskPostgresMapper.domainToDao(task);
    await this.repo.save(dao).then(() => task.commit());
  }

  async remove(task: ScheduledTask): Promise<void> {
    this.eventPub.mergeObjectContext(task);

    await this.repo.delete(task.id.toString()).then(() => task.commit());
  }
}
