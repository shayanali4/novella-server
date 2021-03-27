/**
 * Routes.
 * @param {*} app express applications.
 */
module.exports = function (app) {
app.get('/', (req, res) => {
    res.send('Server is ready');
});
  app.use('/api/files', require('../routes/files'));
  app.use('/api/spell', require('../routes/spell'));
};
