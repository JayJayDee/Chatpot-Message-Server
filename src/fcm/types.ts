export namespace FcmTypes {
  export type DevicePayload = {
    deviceToken: string;
    roomToken: string;
  };

  export type FcmMgr = {
    register: Register,
    unregister: Unregister
  };

  export type Register = (topicName: string, deviceTokens: string[]) => Promise<void>;
  export type Unregister = (topicName: string, deviceTokens: string[]) => Promise<void>;
}