export namespace DeviceStoreTypes {
  export type DeviceParam = {
    memberNo: number;
    deviceToken: string;
  };

  export type Register = (param: DeviceParam) => Promise<void>;
  export type Unregister = (param: DeviceParam) => Promise<void>;
  export type GetDeviceTokens = (memberNo: number) => Promise<string[]>;
}