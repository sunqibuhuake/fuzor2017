var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

router.get('/', checkNotLogin, function (req, res, next) {
    res.render('login');
});
router.post('/', checkNotLogin, function (req, res, next) {
    var name = req.body.name;
    var password = req.body.password;
    UserModel.getUserByName(name)
        .then(function (user) {
            if (!user) {
                console.log('用户不存在');
                req.flash('error', '用户不存在');
                return res.redirect('back');
            }
            // 检查密码是否匹配
            if (sha1(password) !== user.password) {
                console.log('用户名或密码错误')
                req.flash('error', '用户名或密码错误');
                return res.redirect('/login');
            }
            req.flash('success', '登录成功');
            // 用户信息写入 session
            delete user.password;
            req.session.user = user;
            res.redirect('/');
        })
        .catch(next);
});

module.exports = router;
