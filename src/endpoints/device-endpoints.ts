import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';

injectable(EndpointModules.Device.Register,
  [ EndpointModules.Utils.WrapAync ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
    uri: '/device/register',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        const roomToken = req.body['room_token'];
        const deviceToken = req.body['device_token'];

        if (!roomToken || !deviceToken) {
          throw new InvalidParamError('room_token, device_token required');
        }

        console.log(roomToken);
        console.log(deviceToken);

        res.status(200).json({});
      })
    ]
  }));

  injectable(EndpointModules.Device.Unregister,
    [ EndpointModules.Utils.WrapAync ],
    async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
      uri: '/device/unregister',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const roomToken = req.body['room_token'];
          const deviceToken = req.body['device_token'];

          if (!roomToken || !deviceToken) {
            throw new InvalidParamError('room_token, device_token required');
          }

          console.log(roomToken);
          console.log(deviceToken);

          res.status(200).json({});
        })
      ]
    }));