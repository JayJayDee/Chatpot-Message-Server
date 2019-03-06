import { injectable } from 'smart-factory';
import { MessageStoreModules } from './modules';
import { KeyValueStorageModules, KeyValueStorageTypes } from '../kv-storage';
import { MessageStoreTypes } from './types';

injectable(MessageStoreModules.StoreMessage,
  [ KeyValueStorageModules.Push ],
  async (push: KeyValueStorageTypes.Push): Promise<MessageStoreTypes.StoreMessage> =>

    async (roomToken, payload) => {

    });

injectable(MessageStoreModules.GetMessages,
  [ KeyValueStorageModules.Range ],
  async (range: KeyValueStorageTypes.Range): Promise<MessageStoreTypes.GetMessages> =>

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