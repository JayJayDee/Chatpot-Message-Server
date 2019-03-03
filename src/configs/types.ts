export namespace ConfigTypes {
  export type RootConfig = {
    http: HttpConfig;
    credential: CredentialConfig;
    extapi: ExternalApiConfig;
  };
  export type HttpConfig = {
    port: number;
  };
  export type CredentialConfig = {
    authEnabled: boolean;
    sessionExpires: number;
    authSecret: string;
    roomSecret: string;
  };
  export type ExternalApiConfig = {
    roomBaseUri: string;
  };
  export enum Env {
    DEV = 'DEV',
    PROD = 'PROD'
  }
  export type ConfigRule = {
    key: string;
    path: string[];
    defaultValue?: any;
  };
  export type ConfigSource = {[key: string]: any};
  export type ConfigReader = () => Promise<ConfigSource>;
  export type ConfigParser = (src: ConfigSource, rules: ConfigRule[]) => RootConfig;
  export type EnvReader = (src: ConfigSource) => Env;
}