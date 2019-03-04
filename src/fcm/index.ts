import { injectable } from 'smart-factory';
import initDefaultFcmMgr from './default-fcm-manager';
import { ConfigModules, ConfigTypes } from '../configs';
import { FcmModules } from './modules';
import { FcmTypes } from './types';

injectable(FcmModules.FcmMgr,
  [ ConfigModules.FcmConfig ],
  async (cfg: ConfigTypes.FcmConfig): Promise<FcmTypes.FcmMgr> =>
    initDefaultFcmMgr(cfg));

injectable(FcmModules.Register,
  [ FcmModules.FcmMgr ],
  async (mgr: FcmTypes.FcmMgr): Promise<FcmTypes.Register> =>
    mgr.register);

injectable(FcmModules.Unregister,
  [ FcmModules.FcmMgr ],
  async (mgr: FcmTypes.FcmMgr): Promise<FcmTypes.Unregister> =>
    mgr.unregister);

export { FcmModules } from './modules';
export { FcmTypes } from './types';