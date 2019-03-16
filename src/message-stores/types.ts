import { MessageBodyPayload } from '../common-types';

export namespace MessageStoreTypes {
  export type PagedMessage = {
    all: number;
    offset: number;
    size: number;
    messages: MessageBodyPayload[];
  };

  export type StoreMessage = (roomToken: string, paylod: MessageBodyPayload) => Promise<void>;
  export type GetMessages = (roomToken: string, offset: number, size: number) => Promise<PagedMessage>;
  export type GetLastMessages = (roomTokens: string[]) => Promise<{[key: string]: MessageBodyPayload}>;
}