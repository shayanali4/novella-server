/**
 * Initialize.
 * @param {*} app express application
 */
module.exports = function (app) {
  // app.listen(process.env.PORT, () => console.log(`Running on port ${process.env.PORT}`));
  const port = process.env.PORT || 5020;
  app.listen(port, () => console.log(`Running on port ${port}`));
};
