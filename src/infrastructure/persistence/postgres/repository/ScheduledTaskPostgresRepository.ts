import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Uuid } from '@qubizapps/nestjs-commons';
import { Repository } from 'typeorm';

import { ScheduledTask } from '../../../../core/domain/model/ScheduledTask';
import { ScheduledTaskRepository } from '../../../../core/domain/repository/ScheduledTaskRepository';
import { SchedulerModuleOptions } from '../../../../SchedulerModuleOptions';
import { ScheduledTaskPostgresDao } from '../dao/ScheduledTaskPostgresDao';
import { ScheduledTaskPostgresMapper } from '../mapper/index';

@Injectable()
export class ScheduledTaskPostgresRepository implements ScheduledTaskRepository {
  constructor(
    private readonly eventPub: EventPublisher,
    @InjectRepository(ScheduledTaskPostgresDao)
    private readonly repo: Repository<ScheduledTaskPostgresDao>,
    private readonly moduleOptions: SchedulerModuleOptions,
  ) {
    repo.metadata.schema = this.moduleOptions.storage.postgres.schema;
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
