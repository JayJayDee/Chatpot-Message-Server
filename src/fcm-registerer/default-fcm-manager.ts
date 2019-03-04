import { ConfigTypes } from '../configs';
import { FcmTypes } from './types';

type FcmMgr = {
  register: FcmTypes.Register,
  unregister: FcmTypes.Unregister
};

const initDefaultFcmMgr =
  async (cfg: ConfigTypes.FcmConfig): Promise<FcmMgr> => {
    return null;
  };
export default initDefaultFcmMgr;