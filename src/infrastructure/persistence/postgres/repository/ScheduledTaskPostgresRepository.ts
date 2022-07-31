import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Uuid } from '@qubizapps/nestjs-commons';
import { Repository } from 'typeorm';

import { ScheduledTask } from '../../../../core/domain/model/ScheduledTask';
import { ScheduledTaskRepository } from '../../../../core/domain/repository/ScheduledTaskRepository';
import { ScheduledTaskPostgresDao } from '../dao/ScheduledTaskPostgresDao';
import { ScheduledTaskPostgresMapper } from '../mapper/index';

@Injectable()
export class ScheduledTaskPostgresRepository implements ScheduledTaskRepository {
  constructor(
    @InjectRepository(ScheduledTaskPostgresDao)
    private readonly repo: Repository<ScheduledTaskPostgresDao>,
  ) {}

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
    const dao = ScheduledTaskPostgresMapper.domainToDao(task);
    await this.repo.save(dao).then(() => task.commit());
  }

  async remove(task: ScheduledTask): Promise<void> {
    await this.repo.delete(task.id.toString()).then(() => task.commit());
  }
}
