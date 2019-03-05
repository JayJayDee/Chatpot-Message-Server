import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';

export { EndpointTypes } from './types';
export { EndpointModules } from './modules';

// register endpoints to container.
injectable(EndpointModules.Endpoints,
  [ EndpointModules.Device.Register,
    EndpointModules.Device.Unregister,
    EndpointModules.Message.Publish,
    EndpointModules.Message.Messages ],
  async (regDevice, unregDevice, publish, msgs) =>
    ([
      regDevice,
      unregDevice,
      publish,
      msgs
    ]));