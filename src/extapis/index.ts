import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ExtApiTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';

import defaultRequestor from './default-requestor';

// use default http requestor and register to container.
injectable(ExtApiModules.Requestor,
  [ LoggerModules.Logger ],
  async (log: LoggerTypes.Logger): Promise<ExtApiTypes.Request> =>
    defaultRequestor(log));

export { ExtApiModules } from './modules';
export { ExtApiTypes } from './types';