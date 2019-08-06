export namespace ConfigTypes {
  export type RootConfig = {
    http: HttpConfig;
    credential: CredentialConfig;
    extapi: ExternalApiConfig;
    kvStorage: KeyValueStorageConfig;
    amqp: AmqpConfig;
    topic: TopicConfig;
    mysql: MysqlConfig;
  };
  export type HttpConfig = {
    port: number;
  };
  export type CredentialConfig = {
    authEnabled: boolean;
    sessionExpires: number;
    authSecret: string;
    roomSecret: string;
    messageSecret: string;
  };
  export type KeyValueStorageConfig = {
    provider: CacheProvider;
    redis?: RedisConfig;
  };
  export type RedisConfig = {
    host: string;
    port: number;
    password?: string;
  };
  export enum CacheProvider {
    MEMORY = 'MEMORY', REDIS = 'REDIS'
  }
  export type ExternalApiConfig = {
    roomBaseUri: string;
    authBaseUri: string;
  };
  export type AmqpConfig = {
    host: string;
    port: number;
    login: string;
    password: string;
  };
  export type TopicConfig = {
    deviceQueue: string;
    messageExchange: string;
    peerExchange: string;
    websocketJoinsQueue: string;
  };
  export type MysqlConfig = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
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