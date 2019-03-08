import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { UtilModules, UtilTypes } from '../utils';
import { EndpointTypes } from './types';
import { InvalidParamError, BaseLogicError } from '../errors';
import { ExtApiModules, ExtApiTypes } from '../extapis';

class MemberNotFoundError extends BaseLogicError {
  constructor(payload: any) {
    super('MEMBER_NOT_FOUND', payload);
  }
}

injectable(EndpointModules.Message.Publish,
  [ UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken,
    EndpointModules.Utils.WrapAync,
    ExtApiModules.Auth.RequestMembers ],
  async (decRoomToken: UtilTypes.Auth.DecryptRoomToken,
    decMemberToken: UtilTypes.Auth.DecryptMemberToken,
    wrapAsync: EndpointTypes.Utils.WrapAsync,
    reqMembers: ExtApiTypes.Auth.RequestMembers): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/message/publish',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const type = req.body['type'];
          const roomToken = req.body['room_token'];
          const memberToken = req.body['member_token'];
          const content = req.body['content'];

          if (!type || !memberToken || !roomToken || !content) {
            throw new InvalidParamError('type, member_token, room_token, content required');
          }
          const member = decMemberToken(memberToken);
          const room = decRoomToken(roomToken);
          if (!member) throw new InvalidParamError('invalid member token');
          if (!room) throw new InvalidParamError('invalid room token');

          const members = await reqMembers([ member.member_no ]);
          if (members.length === 0) throw new MemberNotFoundError(`member not found: ${memberToken}`);

          res.status(200).json({});
        })
      ]
    }));


injectable(EndpointModules.Message.Messages,
  [ UtilModules.Auth.DecryptRoomToken,
    EndpointModules.Utils.WrapAync ],
  async (decRoomToken: UtilTypes.Auth.DecryptRoomToken,
    wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/messages',
      method: EndpointTypes.EndpointMethod.GET,
      handler: [
        wrapAsync(async (req, res, next) => {
          res.status(200).json({});
        })
      ]
    }));