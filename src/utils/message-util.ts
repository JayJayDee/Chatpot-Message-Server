import { injectable } from 'smart-factory';
import { createCipher } from 'crypto';
import { UtilModules } from './modules';
import { UtilTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

const cipher = (secret: string) =>
  createCipher('des-ede3-cbc', secret);

injectable(UtilModules.Message.CreateMessageId,
  [ ConfigModules.CredentialConfig ],
  async (cfg: ConfigTypes.CredentialConfig): Promise<UtilTypes.Message.CreateMessageId> =>
    (roomToken, memberToken) => {
      const cp = cipher(cfg.messageSecret);
      const buffers = [
        cp.update(`${roomToken}&${memberToken}&${process.hrtime()[1]}`),
        cp.final()
      ];
      return Buffer.concat(buffers).toString('hex');
    });