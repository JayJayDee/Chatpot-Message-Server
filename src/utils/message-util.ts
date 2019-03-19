import { injectable } from 'smart-factory';
import { createHash } from 'crypto';
import { UtilModules } from './modules';
import { UtilTypes } from './types';

injectable(UtilModules.Message.CreateMessageId,
  [],
  async (): Promise<UtilTypes.Message.CreateMessageId> =>
    (roomToken, memberToken) =>
      createHash('sha256')
      .update(`${roomToken}${memberToken}${process.hrtime()[1]}`)
      .digest('hex'));