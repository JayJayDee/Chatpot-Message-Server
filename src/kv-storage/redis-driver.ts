import { isArray, isObject } from 'util';
import { createClient, RedisClient } from 'redis';
import { KeyValueStorageTypes } from './types';
import { ConfigTypes } from '../configs';
import { RedisConnectionError } from './errors';
import { LoggerTypes } from '../loggers';

const initRedisDriver =
  (cfg: ConfigTypes.RedisConfig, log: LoggerTypes.Logger) =>
    async (): Promise<KeyValueStorageTypes.StorageOperations> => {
      log.info('[kv-storage] establishing redis connection ...');
      if (!cfg.password) delete cfg.password;
      const client: RedisClient = createClient(cfg);
      await inspectConnection(client);
      log.info('[kv-storage] redis connection established');
      return {
        get: redisGet(client),
        set: redisSet(client),
        push: redisPushQueue(client),
        range: redisRange(client),
        del: redisDel(client),
        length: redisLength(client),
        getLasts: redisGetLasts(client)
      };
    };
export default initRedisDriver;

const inspectConnection = (client: RedisClient): Promise<void> =>
  new Promise((resolve, reject) => {
    client.get('1', (err: Error, reply: string) => {
      if (err) return reject(new RedisConnectionError(err.message));
      resolve();
    });
  });

const redisGetLasts = (client: RedisClient): KeyValueStorageTypes.GetLasts =>
  (keys: string[]) =>
    new Promise((resolve, reject) => {
      const resp: {[key: string]: any} = {};
      const c = client.multi();
      keys.map((k) => c.lrange(k, 0, 0));
      c.exec((err, replies) => {
        if (err) return reject(err);

        let idx = 0;
        replies.map((elem) => {
          const key = keys[idx];
          let value = null;
          if (elem.length > 0) value = JSON.parse(elem[0]);
          resp[key] = value;
          idx++;
        });
        resolve(resp);
      });
    });

const redisGet = (client: RedisClient): KeyValueStorageTypes.Get =>
  (key: string) =>
    new Promise((resolve, reject) => {
      client.get(key, (err: Error, reply: string) => {
        if (err) return reject(err);
        if (reply === null) return resolve(null);
        try {
          const content = JSON.parse(reply);
          resolve(content);
        } catch (ex) {
          resolve(reply);
        }
      });
    });

const redisSet = (client: RedisClient): KeyValueStorageTypes.Set =>
  (key: string, value: any, expires?: number) =>
    new Promise((resolve, reject) => {
      client.set(key, value, (err: Error, reply: string) => {
        if (err) return reject(err);
        if (!expires) return resolve();
        client.expire(key, expires, (err, reply) => {
          if (err) return reject(err);
          resolve();
        });
      });
    });

const redisPushQueue = (client: RedisClient): KeyValueStorageTypes.Push =>
  (key: string, value: any, maxSize: number) =>
    new Promise((resolve, reject) => {
      let payload: any = value;
      if (isObject(value) || isArray(value)) {
        payload = JSON.stringify(payload);
      }
      client.multi()
        .lpush(key, payload)
        .ltrim(key, 0, maxSize - 1)
        .exec((err, resp) => {
          if (err) return reject(err);
          resolve();
        });
    });

const redisRange = (client: RedisClient): KeyValueStorageTypes.Range =>
  (key: string, start: number, end: number) =>
    new Promise((resolve, reject) => {
      client.lrange(key, start, end - 1, (err, resp) => {
        if (err) return reject(err);
        const resps: any[] = resp.map((elem: any) => {
          try {
            return JSON.parse(elem);
          } catch (err) {
            return elem;
          }
        });
        resolve(resps);
      });
    });

const redisDel = (client: RedisClient): KeyValueStorageTypes.Del =>
  (key: string) =>
    new Promise((resolve, reject) => {
      client.del(key, (err, resp) => {
        if (err) return reject(err);
        resolve();
      });
    });

const redisLength = (client: RedisClient): KeyValueStorageTypes.Length =>
  (key: string) =>
    new Promise((resolve, reject) => {
      client.llen(key, (err, resp) => {
        if (err) return reject(err);
        client.llen(key, (err, resp) => {
          if (err) return reject(err);
          resolve(resp);
        });
      });
    });