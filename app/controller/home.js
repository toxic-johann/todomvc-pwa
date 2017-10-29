'use strict';

module.exports = app => {
  class HomeController extends app.Controller {
    async index() {
      await this.ctx.render('index');
    }
    async offline() {
      await this.ctx.render('offline');
    }
  }
  return HomeController;
};
