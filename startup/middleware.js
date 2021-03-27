const bodyParser = require('body-parser');

/**
 * Middleware.
 * @param {*} app express application
 */
module.exports = app => {
  // Parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  // Parse application/json
  app.use(bodyParser.json());
};
