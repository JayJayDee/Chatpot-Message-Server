export namespace QueueTypes {
  type AmqpSubscriber = <T>(payload: T) => Promise<void>;

  export type AmqpClient = {
    subscribe: (topic: string, subscriber: AmqpSubscriber) => void;
  };
}