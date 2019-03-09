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
      log.debug(`[message-store] storing message to topic: ${key}`);
      await push(key, payload, 100);
    });


injectable(MessageStoreModules.GetMessages,
  [ KeyValueStorageModules.Range,
    KeyValueStorageModules.Length,
    LoggerModules.Logger ],
  async (range: KeyValueStorageTypes.Range,
    length: KeyValueStorageTypes.Length,
    log: LoggerTypes.Logger): Promise<MessageStoreTypes.GetMessages> =>

    async (roomToken, offset, size) => {
      const key = generateKey(roomToken);
      log.debug(`[message-store] fetching messages from topic: ${key}`);
      const messages: any[] = await range(key, offset, offset + size);
      const all = await length(key);
      return {
        messages,
        all,
        offset,
        size: messages.length
      };
    });

const generateKey = (roomToken: string) => `ROOM_MSG_${roomToken}`;