import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';
import { QueueModules, QueueTypes } from '../queues';
import { ConfigModules, ConfigTypes } from '../configs';
import { UtilModules, UtilTypes } from '../utils';

injectable(EndpointModules.Device.Register,
  [ EndpointModules.Utils.WrapAync,
    QueueModules.Publish,
    ConfigModules.TopicConfig,
    UtilModules.Auth.DecryptRoomToken ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    publish: QueueTypes.Publish,
    topicCfg: ConfigTypes.TopicConfig,
    decRoomToken: UtilTypes.Auth.DecryptRoomToken): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/device/register',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const roomToken = req.body['room_token'];
          const deviceToken = req.body['device_token'];

          if (!roomToken || !deviceToken) {
            throw new InvalidParamError('room_token, device_token required');
          }

          const room = decRoomToken(roomToken);
          if (!room) throw new InvalidParamError('invalid room_token');

          await publish(topicCfg.deviceQueue,
            Buffer.from(JSON.stringify({
              type: 'REGISTER',
              device_token: deviceToken,
              topic: roomToken
            })));
          res.status(200).json({});
        })
      ]
    }));


  injectable(EndpointModules.Device.Unregister,
    [ EndpointModules.Utils.WrapAync,
      QueueModules.Publish,
      ConfigModules.TopicConfig,
      UtilModules.Auth.DecryptRoomToken ],
    async (wrapAsync: EndpointTypes.Utils.WrapAsync,
      publish: QueueTypes.Publish,
      topicCfg: ConfigTypes.TopicConfig,
      decRoomToken: UtilTypes.Auth.DecryptRoomToken): Promise<EndpointTypes.Endpoint> =>

      ({
        uri: '/device/unregister',
        method: EndpointTypes.EndpointMethod.POST,
        handler: [
          wrapAsync(async (req, res, next) => {
            const roomToken = req.body['room_token'];
            const deviceToken = req.body['device_token'];

            if (!roomToken || !deviceToken) {
              throw new InvalidParamError('room_token, device_token required');
            }

            const room = decRoomToken(roomToken);
            if (!room) throw new InvalidParamError('invalid room_token');

            await publish(topicCfg.deviceQueue,
              Buffer.from(JSON.stringify({
                type: 'UNREGISTER',
                device_token: deviceToken,
                topic: roomToken
              })));
            res.status(200).json({});
          })
        ]
      }));