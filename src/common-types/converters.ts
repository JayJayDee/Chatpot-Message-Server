import { Nick, Member, Avatar } from '.';
import { MessageType } from './types';

export const toNick = (elem: any): Nick => ({
  en: elem.en,
  ko: elem.ko,
  ja: elem.ja
});

export const toMember = (elem: any): Member => ({
  token: elem.token,
  nick: toNick(elem.nick),
  avatar: toAvatar(elem.avatar),
  region: elem.region,
  language: elem.language,
  gender: elem.gender
});

export const toAvatar = (elem: any): Avatar => ({
  profile_img: elem.profile_img,
  profile_thumb: elem.profile_thumb
});

export const toMessageType = (elem: string): MessageType => {
  if (elem === 'NOTIFICATION' ||
      elem === 'TEXT' ||
      elem === 'IMAGE') {
    return <MessageType>elem;
  }
  return null;
};