export class RedisConnectionError extends Error {
  constructor(msg: any) {
    super(msg);
  }
}