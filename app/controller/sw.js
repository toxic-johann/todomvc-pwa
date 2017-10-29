'use strict';

module.exports = app => {
  class SwController extends app.Controller {
    async offline() {
      const assets = require('../public/dist/dev/webpack-assets.json');
      this.ctx.body = `importScripts("${assets['sw.offline.js']}");`;
      this.ctx.type = 'application/javascript';
    }
  }
  return SwController;
};
