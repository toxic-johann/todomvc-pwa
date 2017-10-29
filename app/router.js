'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.get('/offline', 'home.offline');

  app.get('/offline/sw.js', 'sw.offline');
};
