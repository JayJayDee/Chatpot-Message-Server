import { injectable } from 'smart-factory';
import { QueueSenderModules } from './modules';
import { QueueModules, QueueTypes } from '../queues';
import { DeviceStoreModules, DeviceStoreTypes } from '../device-stores';
import { QueueSenderTypes } from './types';

injectable(QueueSenderModules.SendQueueForMembers,
  [ QueueModules.Publish,
    DeviceStoreModules.GetDeviceTokens ],
  async (publish: QueueTypes.Publish,
    getDeviceTokens: DeviceStoreTypes.GetDeviceTokens): Promise<QueueSenderTypes.SendQueueForMembers> =>

    async (param) => {

    });


injectable(QueueSenderModules.SendQueueForTopic,
  [ QueueModules.Publish ],
  async (publish: QueueTypes.Publish): Promise<QueueSenderTypes.SendQueueForTopic> =>

    async (param) => {

    });