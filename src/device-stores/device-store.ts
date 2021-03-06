import { injectable } from 'smart-factory';
import { DeviceStoreModules } from './modules';
import { DeviceStoreTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(DeviceStoreModules.Register,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<DeviceStoreTypes.Register> =>
    async (param) => {
      const sql = `
        INSERT INTO
          chatpot_device
          (member_no, device_type, device_token, reg_date)
        SELECT
          ?, ?, ?, NOW()
        WHERE
          (SELECT COUNT(no) FROM
            chatpot_device WHERE
              member_no=? AND device_token=?) = 0
      `;
      await mysql.query(sql,
        [ param.memberNo, param.deviceType, param.deviceToken,
          param.memberNo, param.deviceToken ]);
    });

injectable(DeviceStoreModules.Unregister,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<DeviceStoreTypes.Unregister> =>
    async (param) => {
      const sql = `
        DELETE FROM
          chatpot_device
        WHERE
          member_no=? AND
          device_token=?
      `;
      await mysql.query(sql, [ param.memberNo, param.deviceToken ]);
    });

injectable(DeviceStoreModules.GetDeviceTokens,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<DeviceStoreTypes.GetDeviceTokens> =>
    async (memberNos) => {
      const inClause = memberNos.map((m) => '?').join(',');
      const sql = `
        SELECT
          device_token
        FROM
          chatpot_device
        WHERE
          member_no IN (${inClause})
      `;
      const resp: any[] = await mysql.query(sql, memberNos) as any[];
      return resp.map((r) => r.device_token);
    });