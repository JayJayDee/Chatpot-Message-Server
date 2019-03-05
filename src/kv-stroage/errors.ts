export class RedisConnectionError extends Error {
  constructor(msg: any) {
    super(msg);
  }
}

export class KvStorageKeyNotfoundError extends Error {
  constructor(msg: any) {
    super(msg);
  }
}

export class KvStorageInvalidOpsError extends Error {
  constructor(msg: any) {
    super(msg);
  }
}