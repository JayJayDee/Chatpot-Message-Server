import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { UtilModules, UtilTypes } from '../utils';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';

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
          const type = req.body['type'];
          const roomToken = req.body['room_token'];
          const memberToken = req.body['member_token'];
          const content = req.body['content'];

          if (!type || !memberToken || !roomToken || !content) {
            throw new InvalidParamError('type, member_token, room_token, content required');
          }

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