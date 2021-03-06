import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ConfigModules, ConfigTypes } from '../configs';
import { ExtApiTypes } from './types';

injectable(ExtApiModules.Room.RequestRooms,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.Room.RequestRooms> =>

    async (roomNos) => {
      const uri = `${cfg.roomBaseUri}/internal/rooms`;
      const resp = await request({
        uri,
        method: ExtApiTypes.RequestMethod.GET,
        qs: { room_nos: roomNos }
      });
      const rooms = resp.map((r: any) => ({
        token: r.token,
        title: r.title
      }));
      return rooms;
    });


injectable(ExtApiModules.Room.RequestMyRooms,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.Room.RequestMyRooms> =>

    async (memberToken) => {
      const uri = `${cfg.roomBaseUri}/internal/${memberToken}/my`;
      const resp = await request({
        uri,
        method: ExtApiTypes.RequestMethod.GET
      });
      return resp;
    });