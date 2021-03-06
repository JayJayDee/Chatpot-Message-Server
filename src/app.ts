import { init, resolve } from 'smart-factory';
import { EndpointTypes, EndpointModules } from './endpoints';

(async () => {
  await init({
    includes: [`${__dirname}/**/*.ts`, `${__dirname}/**/*.js`]
  });

  const runner = resolve<EndpointTypes.EndpointRunner>(EndpointModules.EndpointRunner);
  runner();
})();