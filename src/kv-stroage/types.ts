export namespace KeyValueStorageTypes {
  export type Get = (key: string) => Promise<any>;
  export type Set = (key: string, value: any, expires?: number) => Promise<void>;

  export type Helper = (key: string, fetcher: () => Promise<any>) => Promise<any>;

  export type StorageOperations = {
    get: Get;
    set: Set;
  };
}