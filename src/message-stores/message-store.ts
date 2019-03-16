import { injectable } from 'smart-factory';
import { MessageStoreModules } from './modules';
import { KeyValueStorageModules, KeyValueStorageTypes } from '../kv-storage';
import { MessageStoreTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';
import { MessageBodyPayload } from '../common-types';

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


injectable(MessageStoreModules.GetLastMessages,
  [ KeyValueStorageModules.GetLasts,
    LoggerModules.Logger ],
  async (getLasts: KeyValueStorageTypes.GetLasts,
    log: LoggerTypes.Logger): Promise<MessageStoreTypes.GetLastMessages> =>

    async (roomTokens) => {
      const keys = roomTokens.map(generateKey);
      const lasts = await getLasts(keys);
      const resp: {[key: string]: MessageBodyPayload} = {};

      Object.keys(lasts).map((k) => {
        const value = lasts[k];
        const origKey = roomTokens.find((value, index) => k.includes(value));
        resp[origKey] = value;
      });
      return resp;
    });

const generateKey = (roomToken: string) => `ROOM_MSG_${roomToken}`;