import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { UtilModules, UtilTypes } from '../utils';
import { EndpointTypes } from './types';
import { InvalidParamError, BaseLogicError } from '../errors';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { toMessageType, ReceptionType, MessageBodyPayload, MessageType } from '../common-types';
import { MessageStoreModules, MessageStoreTypes } from '../message-stores';
import { LoggerModules, LoggerTypes } from '../loggers';
import { QueueSenderModules } from '../queue-sender/modules';
import { QueueSenderTypes } from '../queue-sender/types';

class MemberNotFoundError extends BaseLogicError {
  constructor(payload: any) {
    super('MEMBER_NOT_FOUND', payload);
  }
}

class RoomNotFoundError extends BaseLogicError {
  constructor(payload: any) {
    super('ROOM_NOT_FOUND', payload);
  }
}

const nickCamelCaseEn = (enNick: string) =>
  enNick.split(' ').map((chunk) =>
    chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

injectable(EndpointModules.Message.Publish,
  [ LoggerModules.Logger,
    UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken,
    EndpointModules.Utils.WrapAync,
    ExtApiModules.Auth.RequestMembers,
    ExtApiModules.Room.RequestRooms,
    MessageStoreModules.StoreMessage,
    QueueSenderModules.SendQueueForTopic,
    UtilModules.Message.CreateMessageId ],
  async (log: LoggerTypes.Logger,
    decRoomToken: UtilTypes.Auth.DecryptRoomToken,
    decMemberToken: UtilTypes.Auth.DecryptMemberToken,
    wrapAsync: EndpointTypes.Utils.WrapAsync,
    reqMembers: ExtApiTypes.Auth.RequestMembers,
    reqRooms: ExtApiTypes.Room.RequestRooms,
    storeMessage: MessageStoreTypes.StoreMessage,
    sendQueueForTopic: QueueSenderTypes.SendQueueForTopic,
    messageId: UtilTypes.Message.CreateMessageId): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/room/:room_token/publish',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const type = req.body['type'];
          const roomToken = req.params['room_token'];
          const memberToken = req.body['member_token'];
          const platform = req.body['platform'];
          let content = req.body['content'];

          if (!type || !memberToken || !roomToken || !content) {
            throw new InvalidParamError('type, member_token, room_token, content required');
          }
          const member = decMemberToken(memberToken);
          const room = decRoomToken(roomToken);
          if (!member) throw new InvalidParamError('invalid member token');
          if (!room) throw new InvalidParamError('invalid room token');

          const msgType = toMessageType(type);
          if (!msgType) throw new InvalidParamError('invalid message type. message type must be IMAGE or TEXT');

          if (msgType === MessageType.IMAGE) {
            try {
              content = JSON.parse(content);
            } catch (err) {
              throw new InvalidParamError('invalid image content format');
            }
          }

          const members = await reqMembers([ member.member_no ]);
          if (members.length === 0) throw new MemberNotFoundError(`member not found: ${memberToken}`);

          const rooms = await reqRooms([ room.room_no ]);
          if (rooms.length === 0) throw new RoomNotFoundError(`room not found: ${roomToken}`);

          const body: MessageBodyPayload = {
            push_type: 'MESSAGE',
            message_id: messageId(roomToken, memberToken),
            type: msgType,
            from: members[0],
            to: {
              type: ReceptionType.ROOM,
              token: roomToken
            },
            content,
            platform,
            sent_time: Date.now()
          };

          const pushMessage = {
            topic: roomToken,
            title_loc_key: 'MESSAGE_ARRIVAL',
            title_args: [
              nickCamelCaseEn(members[0].nick.en),
              members[0].nick.ko,
              members[0].nick.ja
            ],
            subtitle_loc_key: 'MESSAGE_ARRIVAL_BODY',
            subtitle_args: [
              rooms[0].title,
              getSubtitle(body)
            ],
            body
          };

          await storeMessage(roomToken, body);
          sendQueueForTopic(pushMessage); // non-awaiting async function -> for the performance.

          res.status(200).json({
            message_id: body.message_id
          });
        })
      ]
    }));


injectable(EndpointModules.Message.Messages,
  [ UtilModules.Auth.DecryptRoomToken,
    EndpointModules.Utils.WrapAync,
    MessageStoreModules.GetMessages ],
  async (decRoomToken: UtilTypes.Auth.DecryptRoomToken,
    wrapAsync: EndpointTypes.Utils.WrapAsync,
    getMessages: MessageStoreTypes.GetMessages): Promise<EndpointTypes.Endpoint> =>

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
          } else {
            size = parseInt(size);
            offset = parseInt(offset);
          }

          if (size === 0) throw new InvalidParamError('size must be larger than 0');
          if (!roomToken) throw new InvalidParamError('room_token required');
          if (!decRoomToken(roomToken)) throw new InvalidParamError('invalid room_token');

          try {
            const resp = await getMessages(roomToken, offset, size);
            res.status(200).json(resp);
          } catch (err) {
            throw new RoomNotFoundError(err.message);
          }
        })
      ]
    }));

const getSubtitle = (body: MessageBodyPayload): string => {
  if (body.type === MessageType.TEXT) return body.content as string;
  else if (body.type === MessageType.IMAGE) return '(Picture)';
  return '';
};