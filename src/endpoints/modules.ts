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
}