import { KeyValueStorageTypes } from './types';
import { LoggerTypes } from '../loggers';

type Storage = {[key: string]: any};
type ExpireSet = {[key: string]: number};

const initMemoryDriver = () =>
  async (log: LoggerTypes.Logger): Promise<KeyValueStorageTypes.StorageOperations> => {
    const storage: Storage = {};
    const expset: ExpireSet = {};
    log.info('[kv-storage] using in-memory storage..');
    return {
      get: memoryGet(storage, expset),
      set: memorySet(storage, expset),
      push: memoryPush(storage),
      range: memoryRange(storage),
      del: memoryDel(storage)
    };
  };
export default initMemoryDriver;

const memoryGet =
  (storage: Storage, expset: ExpireSet): KeyValueStorageTypes.Get =>
    async (key: string) => {
      const value = storage.get(key);
      if (!value) return null;
      if (isExpires(expset, key) === true) {
        delete storage[key];
        delete expset[key];
        return null;
      }
      return value;
    };

const isExpires =
  (expset: ExpireSet, key: string): boolean => {
    if (!expset[key]) return false;
    if (Date.now() < expset[key]) return false;
    return true;
  };

const memorySet =
  (storage: Storage, expset: ExpireSet): KeyValueStorageTypes.Set =>
    async (key: string, value: any, expires?: number) => {
      storage[key] = value;
      delete expset[key];
      if (expires) {
        expset[key] = Date.now() + expires;
      }
    };

const memoryPush =
  (storage: Storage): KeyValueStorageTypes.Push =>
    async (key, value) => {

    };

const memoryRange =
  (storage: Storage): KeyValueStorageTypes.Range =>
    async (key, start, end) => {
      return [];
    };

const memoryDel =
  (storage: Storage): KeyValueStorageTypes.Del =>
    async (key) => {

    };