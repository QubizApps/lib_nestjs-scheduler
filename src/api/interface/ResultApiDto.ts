export class ResultApiDto<T = any> {
  data!: T;
  total?: number;
  offset?: number;
  limit?: number;
}
