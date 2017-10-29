'use strict';
const path = require('path');

module.exports = appInfo => {
  const config = exports = {
    view: {
      defaultViewEngine: 'nunjucks',
      root: path.join(__dirname, '../app/views/dist/'),
      defaultExtension: '.tpl',
      mapping: {
        '.tpl': 'nunjucks',
      },
    },
    redis: {
      client: {
        port: 6379,
        host: '127.0.0.1',
        password: '',
        db: 0,
      },
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1508510473115_5717';

  // add your config here
  config.middleware = [];

  return config;
};
