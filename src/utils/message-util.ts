import { injectable } from 'smart-factory';
import { createCipher } from 'crypto';
import { UtilModules } from './modules';
import { UtilTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

const cipher = (secret: string) =>
  createCipher('des-ede3-cbc', secret);

injectable(UtilModules.Message.CreateMessageId,
  [ ConfigModules.CredentialConfig,
    UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken ],
  async (cfg: ConfigTypes.CredentialConfig,
    decryptRoom: UtilTypes.Auth.DecryptRoomToken,
    decryptMember: UtilTypes.Auth.DecryptMemberToken): Promise<UtilTypes.Message.CreateMessageId> =>

    (roomToken, memberToken) => {
      const cp = cipher(cfg.messageSecret);
      const roomNo = decryptRoom(roomToken).room_no;
      let memberNo: number = 0;
      if (memberToken) memberNo = decryptMember(memberToken).member_no;

      const buffers = [
        cp.update(`${roomNo}&${memberNo}&${process.hrtime()[1]}`),
        cp.final()
      ];
      return Buffer.concat(buffers).toString('hex');
    });