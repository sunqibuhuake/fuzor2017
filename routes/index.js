var io = require('socket.io')();
var checkLogin = require('../middlewares/check').checkLogin


module.exports = function (app) {

  app.get('/', function (req, res) {
    res.redirect('/models');
  });
  app.use('/panel', require('./panel'))
  app.use('/login', require('./login'));

  //app.use(checkLogin);
  app.use('/users', require('./users'));

  app.use('/logout', require('./logout'));
  app.use('/models', require('./models'));
  app.use('/collection', require('./collection'));
  app.use('/dashboard', require('./dashboard'));
  app.use('/management', require('./management'));
  app.use('/discover', require('./discover'));
  app.use('/upload', require('./upload'))
  app.use('/profile', require('./profile'))
  app.use('/qiniu', require('./qiniu'))


  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.render('404');
    }
  });

};
