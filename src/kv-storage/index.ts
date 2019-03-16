import { injectable } from 'smart-factory';
import { KeyValueStorageTypes } from './types';
import { KeyValueStorageModules } from './modules';
import { LoggerTypes, LoggerModules } from '../loggers';
import { ConfigTypes, ConfigModules } from '../configs';
import memoryCacheFactory from './memory-driver';
import redisCacheFactory from './redis-driver';

export const initCache =
  async (cfg: ConfigTypes.KeyValueStorageConfig, logger: LoggerTypes.Logger): Promise<KeyValueStorageTypes.StorageOperations> => {
    let cacheOps: KeyValueStorageTypes.StorageOperations = null;
    const initMemory = memoryCacheFactory();
    const initRedis = redisCacheFactory(cfg.redis, logger);

    if (cfg.provider === ConfigTypes.CacheProvider.MEMORY) {
      cacheOps = await initMemory(logger);
    } else if (cfg.provider === ConfigTypes.CacheProvider.REDIS) {
      cacheOps = await initRedis();
    }
    return cacheOps;
  };

injectable(KeyValueStorageModules.Operations,
  [ ConfigModules.KeyValueStorageConfig, LoggerModules.Logger ],
  initCache);

injectable(KeyValueStorageModules.Get,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.get);

injectable(KeyValueStorageModules.Set,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.set);

injectable(KeyValueStorageModules.Push,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.push);

injectable(KeyValueStorageModules.Range,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.range);

injectable(KeyValueStorageModules.Del,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.del);

injectable(KeyValueStorageModules.Length,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.length);

injectable(KeyValueStorageModules.GetLasts,
  [ KeyValueStorageModules.Operations ],
  async (ops: KeyValueStorageTypes.StorageOperations) => ops.getLasts);

export { KeyValueStorageTypes } from './types';
export { KeyValueStorageModules } from './modules';