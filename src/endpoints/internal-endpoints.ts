import { injectable } from 'smart-factory';
import { isArray } from 'util';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { DeviceStoreModules, DeviceStoreTypes } from '../device-stores';
import { UtilModules, UtilTypes } from '../utils';
import { InvalidParamError } from '../errors';
import { QueueModules, QueueTypes } from '../queues';
import { ConfigModules, ConfigTypes } from '../configs';
import { MessageStoreModules, MessageStoreTypes } from '../message-stores';
import { ReceptionType, MessageType, MessageBodyPayload } from '../common-types';
import { LoggerModules, LoggerTypes } from '../loggers';
import { QueueSenderModules } from '../queue-sender/modules';
import { QueueSenderTypes } from '../queue-sender/types';
import { ExtApiModules, ExtApiTypes } from '../extapis';


injectable(EndpointModules.Internal.EnterRooms,
  [ EndpointModules.Utils.WrapAync ],
  async(wrapAsync: EndpointTypes.Utils.WrapAsync) =>

  ({
    uri: '/internal/rooms/enter',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        res.status(200).json({});
      })
    ]
  }));


injectable(EndpointModules.Internal.LeaveRooms,
  [ EndpointModules.Utils.WrapAync ],
  async(wrapAsync: EndpointTypes.Utils.WrapAsync) =>

  ({
    uri: '/internal/rooms/leave',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        res.status(200).json({});
      })
    ]
  }));


injectable(EndpointModules.Internal.EnterRoom,
  [ EndpointModules.Utils.WrapAync,
    DeviceStoreModules.GetDeviceTokens,
    UtilModules.Auth.DecryptMemberToken,
    QueueModules.Publish,
    ConfigModules.TopicConfig ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    getTokens: DeviceStoreTypes.GetDeviceTokens,
    decMember: UtilTypes.Auth.DecryptMemberToken,
    publish: QueueTypes.Publish,
    topicCfg: ConfigTypes.TopicConfig): Promise<EndpointTypes.Endpoint> =>

  ({
    uri: '/internal/enter',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        const memberToken = req.body['member_token'];
        const roomToken = req.body['room_token'];

        if (!memberToken || !roomToken) throw new InvalidParamError('member_token, room_token required');
        const member = decMember(memberToken);
        const deviceTokens = await getTokens([ member.member_no ]);

        publish(topicCfg.deviceQueue,
          Buffer.from(JSON.stringify({
            type: 'SUBSCRIBE',
            device_tokens: deviceTokens,
            topic: roomToken
          })));

        publish(topicCfg.websocketJoinsQueue,
          Buffer.from(JSON.stringify({
            type: 'SUBSCRIBE',
            member_token: memberToken,
            topic: roomToken
          })));

        res.status(200).json({});
      })
    ]
  }));


injectable(EndpointModules.Internal.LeaveRoom,
  [ EndpointModules.Utils.WrapAync,
    DeviceStoreModules.GetDeviceTokens,
    UtilModules.Auth.DecryptMemberToken,
    QueueModules.Publish,
    ConfigModules.TopicConfig ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    getTokens: DeviceStoreTypes.GetDeviceTokens,
    decMember: UtilTypes.Auth.DecryptMemberToken,
    publish: QueueTypes.Publish,
    topicCfg: ConfigTypes.TopicConfig): Promise<EndpointTypes.Endpoint> =>

  ({
    uri: '/internal/leave',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        const memberToken = req.body['member_token'];
        const roomToken = req.body['room_token'];

        if (!memberToken || !roomToken) throw new InvalidParamError('member_token, room_token required');
        const member = decMember(memberToken);
        const deviceTokens = await getTokens([ member.member_no ]);

        publish(topicCfg.deviceQueue,
          Buffer.from(JSON.stringify({
            type: 'UNSUBSCRIBE',
            device_tokens: deviceTokens,
            topic: roomToken
          })));

        publish(topicCfg.websocketJoinsQueue,
          Buffer.from(JSON.stringify({
            type: 'UNSUBSCRIBE',
            member_token: memberToken,
            topic: roomToken
          })));

        res.status(200).json({});
      })
    ]
  }));


injectable(EndpointModules.Internal.LastMessages,
  [ EndpointModules.Utils.WrapAync,
    MessageStoreModules.GetLastMessages ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    getLasts: MessageStoreTypes.GetLastMessages): Promise<EndpointTypes.Endpoint> =>

  ({
    uri: '/internal/lasts',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        let arr = req.query['room_tokens'];
        const roomTokens: string[] = [];

        if (!arr) throw new InvalidParamError('room_token required');
        if (isArray(arr)) arr.map((t) => roomTokens.push(t));
        else roomTokens.push(arr);

        if (roomTokens.length === 0) {
          throw new InvalidParamError('at least one room_token required');
        }

        const lastMessages = await getLasts(roomTokens);
        res.status(200).json(lastMessages);
      })
    ]
  }));


injectable(EndpointModules.Internal.PublishNotification,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Message.CreateMessageId,
    MessageStoreModules.StoreMessage,
    LoggerModules.Logger,
    QueueSenderModules.SendQueueForTopic ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    createMessageId: UtilTypes.Message.CreateMessageId,
    storeMessage: MessageStoreTypes.StoreMessage,
    log: LoggerTypes.Logger,
    sendQueueForTopic: QueueSenderTypes.SendQueueForTopic): Promise<EndpointTypes.Endpoint> =>

({
  uri: '/internal/room/:room_token/notification',
  method: EndpointTypes.EndpointMethod.POST,
  handler: [
    wrapAsync(async (req, res, next) => {
      const roomToken = req.params['room_token'];
      const roomTitle = req.body['room_title'];
      const action: 'ROOM_LEAVE' | 'ROOM_JOIN' = req.body['action'];
      let content = req.body['content'];
      let member = req.body['member'];

      if (!action) throw new InvalidParamError('action required');
      if (!roomToken) throw new InvalidParamError('room_token required');
      if (!roomTitle) throw new InvalidParamError('room_title required');
      if (!content) throw new InvalidParamError('content required');
      if (!member) throw new InvalidParamError('member_expression required');

      try {
        content = JSON.parse(content);
      } catch (err) {
        throw new InvalidParamError('content must be json');
      }

      try {
        member = JSON.parse(member);
      } catch (err) {
        throw new InvalidParamError('member must be json');
      }

      const messageId = createMessageId(roomToken);

      const to = {
        type: ReceptionType.ROOM,
        token: roomToken
      };
      const body: MessageBodyPayload = {
        to,
        content,
        from: null,
        type: MessageType.NOTIFICATION,
        sent_time: Date.now(),
        message_id: messageId
      };

      // const pushMessage = {
      //   title: title ? title : null,
      //   subtitle: subtitle ? subtitle : null,
      //   title_key: titleKey ? titleKey : null,
      //   subtitle_key: subtitleKey ? subtitleKey : null,
      //   body,
      //   topic: roomToken
      // };

      const pushPayload = {
        topic: roomToken,
        title_loc_key: action,
        title_args: [member.nick.en, member.nick.ko, member.nick.ja],
        subtitle: roomTitle,
        body
      };

      sendQueueForTopic(pushPayload);
      storeMessage(roomToken, body);

      res.status(200).json({
        message_id: messageId
      });
    })
  ]
}));


injectable(EndpointModules.Internal.GetMessages,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptRoomToken,
    MessageStoreModules.GetMessages ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decryptRoomToken: UtilTypes.Auth.DecryptRoomToken,
    getMessagesFromStore: MessageStoreTypes.GetMessages): Promise<EndpointTypes.Endpoint> =>

  ({
    uri: '/internal/room/:room_token/messages',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const roomToken = req.params['room_token'];

        if (!roomToken) throw new InvalidParamError('room_token required');

        const room = decryptRoomToken(roomToken);
        if (room === null) throw new InvalidParamError('invalid room_token');

        const messages = await getMessagesFromStore(roomToken, 0, 100);
        res.status(200).json(messages);
      })
    ]
  }));


injectable(EndpointModules.Internal.PublishPeerMessage,
  [ EndpointModules.Utils.WrapAync,
    QueueSenderModules.SendQueueForMembers,
    ExtApiModules.Auth.RequestMembers ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    sendToMembers: QueueSenderTypes.SendQueueForMembers,
    requestMembers: ExtApiTypes.Auth.RequestMembers): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/internal/roulette/matched',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const memberNosExpr: any[] = req.query['member_nos'];
          const roomToken: string = req.body['room_token'];

          if (!roomToken) {
            throw new InvalidParamError('room_token required');
          }

          if (!memberNosExpr) {
            throw new InvalidParamError('member_no required');
          }
          if (isArray(memberNosExpr) === false) {
            throw new InvalidParamError('member_no must be an array');
          }
          if (memberNosExpr.length !== 2) {
            throw new InvalidParamError('size of member_no must be equal to 2');
          }

          let memberNos: number[] = null;
          try {
            memberNos = memberNosExpr.map((m) => parseInt(m));
          } catch (err) {
            throw new InvalidParamError('each elements of member_nos must be number');
          }

          const members = await requestMembers(memberNos);
          if (members.length !== 2) {
            throw new InvalidParamError('2 member not found');
          }

          const nickTwo = members.find((m) => m.member_no === memberNos[1]).nick;
          sendToMembers({
            member_nos: [ memberNos[0] ],
            title_loc_key: 'ROULETTE_MATCHED',
            subtitle_loc_key: 'ROULETTE_MATCHED_BODY',
            subtitle_args: [nickCamelCaseEn(nickTwo.en), nickTwo.ko, nickTwo.ja],
            body: {
            }
          });

          const nickOne = members.find((m) => m.member_no === memberNos[0]).nick;
          sendToMembers({
            member_nos: [ memberNos[1] ],
            title_loc_key: 'ROULETTE_MATCHED',
            subtitle_loc_key: 'ROULETTE_MATCHED_BODY',
            subtitle_args: [nickCamelCaseEn(nickOne.en), nickOne.ko, nickOne.ja],
            body: {
              room_token: roomToken
            }
          });

          res.status(200).json({});
        })
      ]
    }));

const nickCamelCaseEn = (enNick: string) =>
  enNick.split(' ').map((chunk) =>
    chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');