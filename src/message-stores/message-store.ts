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
      log.debug(`[message-store] messsage stored to topic: ${roomToken}`);
      await push(roomToken, payload, 100);
    });


injectable(MessageStoreModules.GetMessages,
  [ KeyValueStorageModules.Range,
    KeyValueStorageModules.Length ],
  async (range: KeyValueStorageTypes.Range,
    length: KeyValueStorageTypes.Length): Promise<MessageStoreTypes.GetMessages> =>

    async (roomToken, offset, size) => {
      const key = `MESSAGES_${roomToken}`;
      const messages: any[] = await range(key, offset, offset + size);
      console.log(messages);
      return {
        messages: [],
        all: 0,
        size,
        offset
      };
    });