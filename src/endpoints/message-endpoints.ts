import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { UtilModules, UtilTypes } from '../utils';
import { EndpointTypes } from './types';
import { InvalidParamError, BaseLogicError } from '../errors';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { toMessageType, ReceptionType } from '../common-types';
import { MessageStoreModules, MessageStoreTypes } from '../message-stores';

class MemberNotFoundError extends BaseLogicError {
  constructor(payload: any) {
    super('MEMBER_NOT_FOUND', payload);
  }
}

injectable(EndpointModules.Message.Publish,
  [ UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken,
    EndpointModules.Utils.WrapAync,
    ExtApiModules.Auth.RequestMembers,
    MessageStoreModules.StoreMessage ],
  async (decRoomToken: UtilTypes.Auth.DecryptRoomToken,
    decMemberToken: UtilTypes.Auth.DecryptMemberToken,
    wrapAsync: EndpointTypes.Utils.WrapAsync,
    reqMembers: ExtApiTypes.Auth.RequestMembers,
    storeMessage: MessageStoreTypes.StoreMessage): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/room/:room_token/publish',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const type = req.body['type'];
          const roomToken = req.params['room_token'];
          const memberToken = req.body['member_token'];
          let content = req.body['content'];

          if (!type || !memberToken || !roomToken || !content) {
            throw new InvalidParamError('type, member_token, room_token, content required');
          }
          const member = decMemberToken(memberToken);
          const room = decRoomToken(roomToken);
          if (!member) throw new InvalidParamError('invalid member token');
          if (!room) throw new InvalidParamError('invalid room token');

          const msgType = toMessageType(type);
          if (!msgType) throw new InvalidParamError('invalid message type');

          try {
            content = JSON.parse(content);
          } catch (err) {
            throw new InvalidParamError('content must be json-string');
          }

          const members = await reqMembers([ member.member_no ]);
          if (members.length === 0) throw new MemberNotFoundError(`member not found: ${memberToken}`);

          const payload = {
            type: msgType,
            from: members[0],
            to: {
              type: ReceptionType.ROOM,
              token: roomToken
            },
            content
          };
          storeMessage(roomToken, payload);

          // TODO: publish to rebbitmq topic

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
      uri: '/room/:room_token/messages',
      method: EndpointTypes.EndpointMethod.GET,
      handler: [
        wrapAsync(async (req, res, next) => {
          let size = req.query['size'];
          let offset = req.query['offset'];
          const roomToken = req.params['room_token'];

          if (!size || !offset) {
            size = 10;
            offset = 0;
          }
          if (!roomToken) throw new InvalidParamError('room_token required');
          if (!decRoomToken(roomToken)) throw new InvalidParamError('invalid room_token');

          res.status(200).json({});
        })
      ]
    }));