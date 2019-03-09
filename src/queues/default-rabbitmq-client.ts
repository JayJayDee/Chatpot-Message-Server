import { connect, Connection, Channel } from 'amqplib';
import { ConfigTypes } from '../configs';
import { QueueTypes } from './types';
import { LoggerTypes } from '../loggers';

const initRabbitMqClient =
  async (cfg: ConfigTypes.AmqpConfig,
    log: LoggerTypes.Logger): Promise<QueueTypes.AmqpClient> => {
      log.info(`[amqp] establishing amqp-client connection:${cfg.host}...`);
      const client = await createRabbitMqConnection(cfg, log);
      log.info(`[amqp] amqp-client connection established`);
      const channel = await client.createChannel();
      log.info(`[amqp] amqp-channel created`);
      return buildAmqpClient(channel, log);
    };
export default initRabbitMqClient;

const buildAmqpClient =
  (channel: Channel, log: LoggerTypes.Logger): QueueTypes.AmqpClient => ({
    async subscribe(topic, subscriber) {
      await channel.assertQueue(topic, { durable: true });
      log.debug(`[amqp] queue:${topic} consuming started.`);
      channel.consume(topic, (msg) => {
        try {
          const payload: JSON = JSON.parse(msg.content.toString());
          subscriber(payload);
        } catch (err) {
          // if case of failed to parse payload as json, ignore it.
          log.error(`[amqp] malformed message received: ${err.message}`);
        }
      }, { noAck: true });
    }
  });

const createRabbitMqConnection =
  (cfg: ConfigTypes.AmqpConfig, log: LoggerTypes.Logger): Promise<Connection> =>
    new Promise((resolve, reject) => {
      connect({
        hostname: cfg.host,
        port: cfg.port,
        username: cfg.login,
        password: cfg.password
      }).then(resolve).catch(reject);
    });