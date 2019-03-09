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
      return [];
    });