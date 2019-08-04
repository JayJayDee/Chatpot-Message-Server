export namespace DeviceStoreTypes {
  export type DeviceType  = 'ANDROID' | 'IOS';
  export type DeviceParam = {
    memberNo: number;
    deviceToken: string;
    deviceType: DeviceType;
  };
  export type DeviceUnregisterParam = {
    memberNo: number;
    deviceToken: string;
  };

  export type Register = (param: DeviceParam) => Promise<void>;
  export type Unregister = (param: DeviceUnregisterParam) => Promise<void>;
  export type GetDeviceTokens = (memberNo: number[]) => Promise<string[]>;
}