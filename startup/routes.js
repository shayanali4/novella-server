/**
 * Routes.
 * @param {*} app express applications.
 */
module.exports = function (app) {
  app.use('/api/files', require('../routes/files'));
  app.use('/api/spell', require('../routes/spell'));
};
