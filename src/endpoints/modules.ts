export namespace EndpointModules {
  export const EndpointRunner = 'Endpoint/EndpointRunner';
  export const Endpoints = 'Endpoint/Endpoints';
  export enum Utils {
    WrapAync = 'Endpoint/Utils/WrapAsync'
  }

  export enum Device {
    Register = 'Endpoint/Device/Register',
    Unregister = 'Endpoint/Device/Unregister'
  }

  export enum Message {
    Publish = 'Endpoint/Message/Publish',
    Messages = 'Endpoint/Message/Messages'
  }

  export enum Internal {
    EnterRooms = 'Endpoint/Internal/EnterRooms',
    LeaveRooms = 'Endpoint/Internal/LeaveRooms',
    EnterRoom = 'Endpoint/Internal/EnterRoom',
    LeaveRoom = 'Endpoint/Internal/LeaveRoom',
    LastMessages = 'Endpoint/Internal/LastMessages',
    PublishNotification = 'Endpoint/Internal/PublishNotification',
    GetMessages = 'Endpoint/Internal/GetMessages',
    PublishPeerMessage = 'Endpoint/Internal/PublishPeerMessage'
  }
}