export namespace QueueSenderTypes {
  type BaseParam = {
    title?: string;
    title_loc_key?: string;
    title_args?: any[];
    subtitle?: string;
    subtitle_loc_key?: string;
    subtitle_args: any[];
    body: {[key: string]: any};
  };

  interface SendMembersParam extends BaseParam {
    member_nos: number[];
  }
  export type SendQueueForMembers = (param: SendMembersParam) => Promise<void>;

  interface SendTopicParam extends BaseParam {
    topic: string;
  }
  export type SendQueueForTopic = (param: SendTopicParam) => Promise<void>;
}