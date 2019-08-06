import { injectable } from 'smart-factory';
import { QueueSenderModules } from './modules';
import { QueueModules, QueueTypes } from '../queues';
import { DeviceStoreModules, DeviceStoreTypes } from '../device-stores';
import { QueueSenderTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

injectable(QueueSenderModules.SendQueueForMembers,
  [ ConfigModules.TopicConfig,
    QueueModules.Publish,
    DeviceStoreModules.GetDeviceTokens ],
  async (topicCfg: ConfigTypes.TopicConfig,
    publish: QueueTypes.Publish,
    getDeviceTokens: DeviceStoreTypes.GetDeviceTokens): Promise<QueueSenderTypes.SendQueueForMembers> =>

    async (param) => {
      const deviceTokens = await getDeviceTokens(param.member_nos);

      const message = {
        member_nos: param.member_nos,
        device_tokens: deviceTokens,
        title: param.title,
        title_loc_key: param.title_loc_key,
        title_args: param.title_args,
        subtitle: param.subtitle,
        subtitle_loc_key: param.subtitle_loc_key,
        subtitle_args: param.subtitle_args,
        body: param.body
      };

      await publish(topicCfg.peerExchange,
        Buffer.from(JSON.stringify(message)),
        QueueTypes.QueueType.EXCHANGE);
    });


injectable(QueueSenderModules.SendQueueForTopic,
  [ ConfigModules.TopicConfig,
    QueueModules.Publish ],
  async (topicCfg: ConfigTypes.TopicConfig,
    publish: QueueTypes.Publish): Promise<QueueSenderTypes.SendQueueForTopic> =>

    async (param) => {
      const message = {
        topic: param.topic,
        title: param.title,
        title_loc_key: param.title_loc_key,
        title_args: param.title_args,
        subtitle: param.subtitle,
        subtitle_loc_key: param.subtitle_loc_key,
        subtitle_args: param.subtitle_args,
        body: param.body
      };

      await publish(topicCfg.messageExchange,
        Buffer.from(JSON.stringify(message)),
        QueueTypes.QueueType.EXCHANGE);
    });