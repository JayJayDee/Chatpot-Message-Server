import { MessagePayload } from '../common-types';

export namespace MessageStoreTypes {
  export type PagedMessage = {
    all: number;
    offset: number;
    size: number;
    messages: MessagePayload[];
  };

  export type StoreMessage = (roomToken: string, paylod: MessagePayload) => Promise<void>;
  export type GetMessages = (roomToken: string, offset: number, size: number) => Promise<PagedMessage>;
}