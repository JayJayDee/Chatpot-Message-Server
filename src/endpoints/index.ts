import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';

export { EndpointTypes } from './types';
export { EndpointModules } from './modules';

// register endpoints to container.
injectable(EndpointModules.Endpoints,
  [ EndpointModules.Device.Register,
    EndpointModules.Device.Unregister,
    EndpointModules.Message.Publish,
    EndpointModules.Message.Messages,
    EndpointModules.Internal.EnterRoom,
    EndpointModules.Internal.LeaveRoom,
    EndpointModules.Internal.LastMessages,
    EndpointModules.Internal.PublishNotification ],
  async (regDevice, unregDevice, publish, msgs, enter, leave, lastMsgs, publishNoti) =>
    ([
      regDevice,
      unregDevice,
      publish,
      msgs,
      enter,
      leave,
      lastMsgs,
      publishNoti
    ]));