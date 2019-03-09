export namespace QueueTypes {
  type AmqpSubscriber = <T>(payload: T) => Promise<void>;

  export enum QueueType {
    EXCHANGE = 'exchange',
    QUEUE = 'queue'
  }

  export type Subscribe = (topic: string, subscriber: AmqpSubscriber) => void;
  export type Publish = (topic: string, payload: Buffer, type?: QueueType) => Promise<void>;

  export type AmqpClient = {
    subscribe: Subscribe;
    publish: Publish;
  };
}