import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { InvalidParamError } from '../errors';
import { UtilModules, UtilTypes } from '../utils';
import { DeviceStoreModules, DeviceStoreTypes } from '../device-stores';

injectable(EndpointModules.Device.Register,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptMemberToken,
      DeviceStoreModules.Register ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decMember: UtilTypes.Auth.DecryptMemberToken,
    register: DeviceStoreTypes.Register): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/device/register',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        wrapAsync(async (req, res, next) => {
          const memberToken = req.body['member_token'];
          const deviceToken = req.body['device_token'];
          let deviceType = req.body['device_type'];

          if (!memberToken || !deviceToken) {
            throw new InvalidParamError('room_token, device_token required');
          }

          if (!deviceType) {
            // TODO: must be removed after app updated.
            deviceType = 'IOS';
          } else {
            if (deviceType !== 'ANDROID' && deviceType !== 'IOS') {
              throw new InvalidParamError('device_type must be ANDROID or IOS');
            }
          }

          const member = decMember(memberToken);
          if (!member) throw new InvalidParamError('invalid member_token');

          await register({ deviceToken, deviceType, memberNo: member.member_no });
          res.status(200).json({});
        })
      ]
    }));


  injectable(EndpointModules.Device.Unregister,
    [ EndpointModules.Utils.WrapAync,
      UtilModules.Auth.DecryptMemberToken,
      DeviceStoreModules.Unregister ],
    async (wrapAsync: EndpointTypes.Utils.WrapAsync,
      decMember: UtilTypes.Auth.DecryptMemberToken,
      unregister: DeviceStoreTypes.Unregister): Promise<EndpointTypes.Endpoint> =>

      ({
        uri: '/device/unregister',
        method: EndpointTypes.EndpointMethod.POST,
        handler: [
          wrapAsync(async (req, res, next) => {
            const memberToken = req.body['member_token'];
            const deviceToken = req.body['device_token'];

            if (!memberToken || !deviceToken) {
              throw new InvalidParamError('room_token, device_token required');
            }

            const member = decMember(memberToken);
            if (!member) throw new InvalidParamError('invalid member_token');

            await unregister({ deviceToken, memberNo: member.member_no });
            res.status(200).json({});
          })
        ]
      }));