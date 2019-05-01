const jsdoc = require('swagger-jsdoc');
import { injectable } from 'smart-factory';
import { SwaggerModules } from './modules';

const apiDocOptions = {
  apis: [`${__dirname}/*.yaml`],
  swaggerDefinition: {
    info: {
      title: 'Chatpot-Message-API',
      description: 'Chatpot messaging APIs',
      version: '1.0.0'
    }
  },
};

injectable(SwaggerModules.SwaggerConfigurator,
  [],
  async () => jsdoc(apiDocOptions));