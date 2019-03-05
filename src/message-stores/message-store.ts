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
      return null;
    });