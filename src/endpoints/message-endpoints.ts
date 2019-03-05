import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { UtilModules, UtilTypes } from '../utils';
import { EndpointTypes } from './types';

injectable(EndpointModules.Message.Publish,
  [ UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken,
    EndpointModules.Utils.WrapAync ],
  async (decRoomToken: UtilTypes.Auth.DecryptRoomToken,
    decMemberToken: UtilTypes.Auth.DecryptMemberToken,
    wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/message/publish',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
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