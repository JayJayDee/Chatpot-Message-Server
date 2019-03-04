import { injectable } from 'smart-factory';
import initDefaultFcmMgr from './default-fcm-manager';
import { ConfigModules, ConfigTypes } from '../configs';

injectable('FCM_MGR',
  [ ConfigModules.FcmConfig ],
  async (cfg: ConfigTypes.FcmConfig) => initDefaultFcmMgr(cfg));

export { FcmModules } from './modules';
export { FcmTypes } from './types';