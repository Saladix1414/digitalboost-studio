export type PostgresQueryResult<T> = {
  readonly rows:
    readonly T[];

  readonly rowCount:
    number | null;
};

export interface PostgresQueryable {
  query<T = unknown>(
    statement:
      string,

    parameters?:
      readonly unknown[]
  ):
    Promise<
      PostgresQueryResult<T>
    >;
}

export interface PostgresClientLike
  extends PostgresQueryable {
  release():
    void;
}

export interface PostgresPoolLike
  extends PostgresQueryable {
  connect():
    Promise<
      PostgresClientLike
    >;
}
