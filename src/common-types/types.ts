export type Member = {
  member_no: number;
  token: string;
  region: string;
  language: string;
  gender: string;
  avatar: Avatar;
  nick: Nick;
};

export type Room = {
  title: string;
};

export type Reception = {
  type: ReceptionType;
  token: string;
};

export enum ReceptionType {
  ROOM = 'ROOM'
}

export type Nick = {
  en: string;
  ko: string;
  ja: string;
};

export type Avatar = {
  profile_img: string;
  profile_thumb: string;
};

export enum MessageType {
  NOTIFICATION = 'NOTIFICATION',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export type MessageBodyPayload = {
  message_id: string;
  type: MessageType;
  from?: Member;
  to: Reception;
  content: any;
  sent_time: number;
};

export type PushMessage = {
  title: string;
  subtitle: string;
  topic: string;
  body: MessageBodyPayload;
};

export enum NotifyType {
  ROULETTE_MATCHED = 'ROULETTE_MATCHED'
}

export type NotifyBodyPayload = {
  type: NotifyType,
  from?: Member;
};

export type PeerPushMessage = {
  title: string;
  subtitle: string;
  to_device_tokens: string[];
  body: NotifyBodyPayload;
};