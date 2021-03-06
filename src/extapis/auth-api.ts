import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ExtApiTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import { toMember } from '../common-types';

injectable(ExtApiModules.Auth.RequestMembers,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.Auth.RequestMembers> =>

    async (memberNos) => {
      const uri = `${cfg.authBaseUri}/internal/member`;
      const resp = await request({
        uri,
        method: ExtApiTypes.RequestMethod.GET,
        qs: {
          member_nos: memberNos
        }
      });
      const members = resp.map(toMember);
      return members;
    });