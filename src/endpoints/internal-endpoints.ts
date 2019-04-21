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
        const deviceTokens = await getTokens(member.member_no);

        publish(topicCfg.deviceQueue,
          Buffer.from(JSON.stringify({
            type: 'SUBSCRIBE',
            device_tokens: deviceTokens,
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
        const deviceTokens = await getTokens(member.member_no);

        publish(topicCfg.deviceQueue,
          Buffer.from(JSON.stringify({
            type: 'UNSUBSCRIBE',
            device_tokens: deviceTokens,
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
    QueueModules.Publish,
    ConfigModules.TopicConfig,
    LoggerModules.Logger ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    createMessageId: UtilTypes.Message.CreateMessageId,
    storeMessage: MessageStoreTypes.StoreMessage,
    publishToQueue: QueueTypes.Publish,
    topicCfg: ConfigTypes.TopicConfig,
    log: LoggerTypes.Logger): Promise<EndpointTypes.Endpoint> =>

({
  uri: '/internal/room/:room_token/notification',
  method: EndpointTypes.EndpointMethod.POST,
  handler: [
    wrapAsync(async (req, res, next) => {
      const roomToken = req.params['room_token'];
      const title = req.body['title'];
      const titleKey = req.body['title_key'];
      const subtitle = req.body['subtitle'];
      const subtitleKey = req.body['subtitle_key'];
      let content = req.body['content'];

      if (!subtitle && !subtitleKey) throw new InvalidParamError('subtitle or subtitle_key required');
      if (!title && !titleKey) throw new InvalidParamError('title or title_key required');
      if (!roomToken) throw new InvalidParamError('room_token required');
      if (!content) throw new InvalidParamError('content required');

      try {
        content = JSON.parse(content);
      } catch (err) {
        throw new InvalidParamError('content must be json');
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
      const pushMessage = {
        title: title ? title : null,
        subtitle: subtitle ? subtitle : null,
        title_key: titleKey ? titleKey : null,
        subtitle_key: subtitleKey ? subtitleKey : null,
        body,
        topic: roomToken
      };

      log.debug('[internal-endpoint] rabbitmq payload');
      log.debug(pushMessage);

      // non-awaiting async functions. -> for the performance.
      storeMessage(roomToken, body);
      publishToQueue(topicCfg.messageExchange,
        Buffer.from(JSON.stringify(pushMessage)),
        QueueTypes.QueueType.EXCHANGE);
      //////

      res.status(200).json({
        message_id: messageId
      });
    })
  ]
}));