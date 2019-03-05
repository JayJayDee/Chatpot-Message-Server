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
        del: redisDel(client)
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

    });

const redisRange = (client: RedisClient): KeyValueStorageTypes.Range =>
  (key: string, start: number, end: number) =>
    new Promise((resolve, reject) => {

    });

const redisDel = (client: RedisClient): KeyValueStorageTypes.Del =>
  (key: string) =>
    new Promise((resolve, reject) => {

    });