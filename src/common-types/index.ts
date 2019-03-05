export type Member = {
  token: string;
  region: string;
  language: string;
  gender: string;
  avatar: Avatar;
  nick: Nick;
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

export type MessagePayload = {
  type: MessageType;
  from: Member;
  to: Reception;
  content: string | ImageMessageContent;
};

export type ImageMessageContent = {
  img: string;
  thumb: string;
};