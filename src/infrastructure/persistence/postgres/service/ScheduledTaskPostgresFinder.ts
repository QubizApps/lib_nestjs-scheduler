import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';

import { ScheduledTaskDto } from '../../../../core/read/dto/ScheduledTaskDto';
import {
  ScheduledTaskFilters,
  ScheduledTaskFinder,
} from '../../../../core/read/service/ScheduledTaskFinder';
import { FinderResult } from '../../../../core/read/service/types';
import { SchedulerModuleOptions } from '../../../../SchedulerModuleOptions';
import {
  ScheduledTaskPostgresDao,
  ScheduledTaskPostgresEntitySchema,
} from '../dao/ScheduledTaskPostgresDao';
import { ScheduledTaskPostgresMapper } from '../mapper/index';

@Injectable()
export class ScheduledTaskPostgresFinder implements ScheduledTaskFinder {
  private repo: Repository<ScheduledTaskPostgresDao>;

  constructor(
    private readonly connection: DataSource,
    private readonly moduleOptions: SchedulerModuleOptions,
  ) {
    this.repo = this.connection.getRepository<ScheduledTaskPostgresDao>(
      ScheduledTaskPostgresEntitySchema(this.moduleOptions.storage.postgres.schema),
    );
  }

  async findAll(filters: ScheduledTaskFilters): Promise<FinderResult<ScheduledTaskDto[]>> {
    const qb = this.repo.createQueryBuilder('task');

    if (filters.ids) {
      qb.andWhere('task.id = ANY(:ids)', { ids: filters.ids });
    }

    if (filters.types) {
      qb.andWhere('task.type = ANY(:types)', { types: filters.types });
    }

    if (filters.taskTypes) {
      qb.andWhere('task.taskType = ANY(:taskTypes)', { taskTypes: filters.taskTypes });
    }

    if (filters.statuses) {
      qb.andWhere('task.status = ANY(:statuses)', { statuses: filters.statuses });
    }

    if (filters.tags) {
      qb.andWhere(
        new Brackets((query) => {
          filters.tags?.forEach((tags) => {
            query.orWhere('task.tags @> :tags', { tags });
          });
        }),
      );
    }

    if (filters.offset) {
      qb.offset(filters.offset);
    }

    if (filters.limit) {
      qb.limit(filters.limit);
    }

    qb.addOrderBy('task.completedAt', 'DESC');
    qb.addOrderBy('task.runAt', 'DESC');

    const [tasks, total] = await qb.getManyAndCount();

    return {
      data: tasks.map(ScheduledTaskPostgresMapper.daoToReadDto),
      total,
      offset: filters.offset,
      limit: filters.limit,
    };
  }
}
