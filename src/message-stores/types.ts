import { MessagePayload } from '../common-types';

export namespace MessageStoreTypes {
  export type StoreMessage = (roomToken: string, paylod: MessagePayload) => Promise<void>;
}