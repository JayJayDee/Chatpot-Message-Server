export namespace KeyValueStorageTypes {
  export type Get = (key: string) => Promise<any>;
  export type Set = (key: string, value: any, expires?: number) => Promise<void>;
  export type Push = (key: string, value: any, maxSize: number) => Promise<void>;
  export type Range = (key: string, start: number, end: number) => Promise<any[]>;
  export type Del = (key: string) => Promise<void>;
  export type Length = (key: string) => Promise<number>;

  export type Helper = (key: string, fetcher: () => Promise<any>) => Promise<any>;

  export type StorageOperations = {
    get: Get;
    set: Set;
    push: Push;
    range: Range;
    del: Del;
    length: Length;
  };
}