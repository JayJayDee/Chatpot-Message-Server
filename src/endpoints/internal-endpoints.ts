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

        if (isArray(arr)) arr.map((t) => roomTokens.push(t));
        else arr.push(arr);

        if (roomTokens.length === 0) {
          throw new InvalidParamError('at least one room_token required');
        }

        const lastMessages = await getLasts(roomTokens);
        res.status(200).json(lastMessages);
      })
    ]
  }));