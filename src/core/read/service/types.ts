export type FinderResult<T> = {
  data: T;
  total?: number;
  offset?: number;
  limit?: number;
};
