import { ExtApiTypes } from './types';
import * as rp from 'request-promise-native';
import { LoggerTypes } from '../loggers';

const requestor =
  (log: LoggerTypes.Logger): ExtApiTypes.Request =>
    async (param: ExtApiTypes.RequestParam): Promise<any> => {
      log.debug(`[extapi] request created: ${param.method} ${param.uri}`);
      return await rp(param.uri, {
        method: param.method,
        body: param.body,
        qs: param.qs,
        headers: param.headers,
        json: true
      });
    };
export default requestor;