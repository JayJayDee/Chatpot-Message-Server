import { injectable } from 'smart-factory';
import { ConfigModules } from './modules';
import { ConfigTypes } from './types';

export { ConfigModules } from './modules';
export { ConfigTypes } from './types';

injectable(ConfigModules.EmptyConfig, [], async (): Promise<ConfigTypes.RootConfig> => ({
  http: {
    port: null
  },
  credential: {
    authEnabled: null,
    sessionExpires: null,
    authSecret: null,
    roomSecret: null
  },
  extapi: {
    roomBaseUri: null,
    authBaseUri: null
  },
  kvStorage: {
    provider: null
  },
  amqp: {
    host: null,
    port: null,
    login: null,
    password: null
  },
  topic: {
    deviceQueue: null,
    messageExchange: null
  }
}));

// configuration rules.
injectable(ConfigModules.ConfigRules, [],
  async (): Promise<ConfigTypes.ConfigRule[]> => ([
    { key: 'HTTP_PORT', path: ['http', 'port'], defaultValue: 8080 },
    { key: 'CREDENTIAL_AUTH_ENABLED', path: ['credential', 'authEnabled'], defaultValue: false },
    { key: 'CREDENTIAL_AUTH_SECRET', path: ['credential', 'authSecret'] },
    { key: 'CREDENTIAL_AUTH_SESSION_EXPIRES', path: ['credential', 'sessionExpires'], defaultValue: 60 },
    { key: 'CREDENTIAL_ROOM_SECRET', path: ['credential', 'roomSecret'] },
    { key: 'EXTAPI_ROOM_URI', path: ['extapi', 'roomBaseUri'] },
    { key: 'EXTAPI_AUTH_URI', path: ['extapi', 'authBaseUri'] },
    { key: 'KV_STORAGE_PROVIDER', path: ['kvStorage', 'provider'], defaultValue: 'MEMORY' },
    { key: 'KV_STORAGE_REDIS_HOST', path: ['kvStorage', 'redis', 'host'], defaultValue: null },
    { key: 'KV_STORAGE_REDIS_PORT', path: ['kvStorage', 'redis', 'port'], defaultValue: null },
    { key: 'KV_STORAGE_REDIS_PASSWORD', path: ['kvStorage', 'redis', 'password'], defaultValue: null },
    { key: 'AMQP_HOST', path: ['amqp', 'host'] },
    { key: 'AMQP_PORT', path: ['amqp', 'port'] },
    { key: 'AMQP_LOGIN', path: ['amqp', 'login'] },
    { key: 'AMQP_PASSWORD', path: ['amqp', 'password'] },
    { key: 'TOPIC_DEVICE_QUEUE', path: ['topic', 'deviceQueue'] },
    { key: 'TOPIC_MESSAGE_EXCHANGE', path: ['topic', 'messageExchange'] }
  ]));

injectable(ConfigModules.ConfigSource,
  [ConfigModules.ConfigReader],
  async (read: ConfigTypes.ConfigReader) => read());

injectable(ConfigModules.RootConfig,
  [ConfigModules.ConfigParser,
   ConfigModules.ConfigSource,
   ConfigModules.ConfigRules],
  async (parse: ConfigTypes.ConfigParser,
    src: ConfigTypes.ConfigSource,
    rules: ConfigTypes.ConfigRule[]): Promise<ConfigTypes.RootConfig> => parse(src, rules));

injectable(ConfigModules.HttpConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.http);

injectable(ConfigModules.CredentialConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.credential);

injectable(ConfigModules.ExternalApiConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.extapi);

injectable(ConfigModules.KeyValueStorageConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.kvStorage);

injectable(ConfigModules.AmqpConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.amqp);

injectable(ConfigModules.TopicConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.topic);

injectable(ConfigModules.Env,
  [ConfigModules.ConfigSource],
  async (src: ConfigTypes.ConfigSource) => {
    const envExpr = src['NODE_ENV'];
    if (!envExpr || envExpr === 'production') return ConfigTypes.Env.DEV;
    return ConfigTypes.Env.PROD;
  });