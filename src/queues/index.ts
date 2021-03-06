import { injectable } from 'smart-factory';
import { QueueModules } from './modules';
import { QueueTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import initRabbitMq from './default-rabbitmq-client';
import { LoggerModules, LoggerTypes } from '../loggers';

injectable(QueueModules.AmqpClient,
  [ ConfigModules.AmqpConfig,
    LoggerModules.Logger ],
  async (cfg: ConfigTypes.AmqpConfig,
    log: LoggerTypes.Logger): Promise<QueueTypes.AmqpClient> =>
      initRabbitMq(cfg, log));

injectable(QueueModules.Publish,
  [ QueueModules.AmqpClient ],
  async (client: QueueTypes.AmqpClient) => client.publish);

injectable(QueueModules.Subscribe,
  [ QueueModules.AmqpClient ],
  async (client: QueueTypes.AmqpClient) => client.subscribe);

export { QueueModules } from './modules';
export { QueueTypes } from './types';