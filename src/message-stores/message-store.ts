import { injectable } from 'smart-factory';
import { MessageStoreModules } from './modules';
import { KeyValueStorageModules, KeyValueStorageTypes } from '../kv-storage';
import { MessageStoreTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';

injectable(MessageStoreModules.StoreMessage,
  [ KeyValueStorageModules.Push,
    LoggerModules.Logger ],
  async (push: KeyValueStorageTypes.Push,
    log: LoggerTypes.Logger): Promise<MessageStoreTypes.StoreMessage> =>

    async (roomToken, payload) => {
      const key = generateKey(roomToken);
      log.debug(`[message-store] messsage stored to topic: ${key}`);
      await push(key, payload, 100);
    });


injectable(MessageStoreModules.GetMessages,
  [ KeyValueStorageModules.Range,
    KeyValueStorageModules.Length ],
  async (range: KeyValueStorageTypes.Range,
    length: KeyValueStorageTypes.Length): Promise<MessageStoreTypes.GetMessages> =>

    async (roomToken, offset, size) => {
      const key = generateKey(roomToken);
      console.log(key);
      const messages: any[] = await range(key, offset, offset + size);
      const all = await length(key);
      return {
        messages,
        all,
        size,
        offset
      };
    });

const generateKey = (roomToken: string) => `ROOM_MSG_${roomToken}`;