import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ExtApiTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

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
      const members = resp.map((elem: any) => ({
        token: elem.token,
        region: elem.region,
        language: elem.language,
        gender: elem.gender,
        nick: {
          ko: elem.nick.ko,
          ja: elem.nick.ja,
          en: elem.nick.en
        },
        avatar: elem.avatar
      })); // TODO: mapping function export required
      return members;
    });