import * as admin from 'firebase-admin';
import { readFile } from 'fs';
import { ConfigTypes } from '../configs';
import { FcmTypes } from './types';
import { LoggerTypes } from '../loggers';

const initDefaultFcmMgr =
  async (cfg: ConfigTypes.FcmConfig, log: LoggerTypes.Logger): Promise<FcmTypes.FcmMgr> => {
    await tryOpenPrivKeyFile(cfg.privKeyPath);
    admin.initializeApp({
      credential: admin.credential.cert(require(cfg.privKeyPath))
    });
    const fcm = admin.messaging();
    log.debug('[fcm] fcm-admin initialized');
    return {
      register: registerFunction(fcm),
      unregister: unregisterFunction(fcm)
    };
  };
export default initDefaultFcmMgr;

const registerFunction = (fcm: admin.messaging.Messaging): FcmTypes.Register =>
  async (topicName, deviceTokens) => {
    await fcm.subscribeToTopic(deviceTokens, topicName);
  };

const unregisterFunction = (fcm: admin.messaging.Messaging): FcmTypes.Unregister =>
  async (topicName, deviceTokens) => {
    await fcm.unsubscribeFromTopic(deviceTokens, topicName);
  };

const tryOpenPrivKeyFile = (path: string): Promise<void> =>
  new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) return reject(new Error(`Fcm Private key file not found: ${path}`));
      try {
        JSON.parse(data.toString());
        resolve();
      } catch (err) {
        throw new Error(`Fcm Private key file was invalid format: ${path}`);
      }
    });
  });