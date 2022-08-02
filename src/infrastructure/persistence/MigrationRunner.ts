export interface MigrationRunner {
  run(): Promise<void>;
}

export class MigrationRunner {}
