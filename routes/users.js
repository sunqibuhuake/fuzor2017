/**
 * Created by sunqi on 17/1/14.
 */
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var UserModel = require('../models/users');
var checkAdmin = require('../middlewares/check').checkAdmin;

//管理员权限检查
router.use(checkAdmin)
//查询所有用户
router.get('/', function (req, res, next) {
    UserModel.getUsers()
        .then(users => {
            return res.render('users', {
                users: users
            })
        })
        .catch(next)
});
//新建用户
router.post('/new', (req, res, next) => {
    const user = req.body;
    const name = user.name;
    const password = user.password;
    const repassword = user.repassword;
    const role = user.role;
    const avatar = user.avatar;
    const nickname = user.nickname;

    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (!avatar) {
            throw new Error('缺少头像');
        }
        if (password < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
        if (['admin', 'viewer'].indexOf(gender) === -1) {
            throw new Error('权限选项错误');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/users/new');
    }

    // 密码加密
    const pwd = sha1(password);
    // 待写入数据库的用户信息
    const  newUser = {
        name: name,
        password: pwd,
        role: role,
        avatar: avatar,
        nickname: nickname
    };
    // 用户信息写入数据库
    UserModel.create(newUser)
        .then(function (result) {
            _user = result.ops[0];
            delete _user.password;
            req.session.user = _user;
            req.flash('success', '注册成功');
            res.redirect('/users');
        })
        .catch(function (e) {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                return res.redirect('/users');
            }
            next(e);
        });
})

//删除用户
router.get('/:id/delete', (req, res, next) => {
    UserModel.deleteUserById(req.params.id)
        .then(() => {
            req.flash('success', '删除用户成功');
            return res.redirect('/users')
        })
        .catch(e => {
            req.flash('error', e.message);
            return res.redirect('/users');
            next(e);
        })
})

//编辑用户
router.get('/:id/update', (req, res, next) => {
    UserModel.updateUserById(req.params.id)
        .then(user => {
            req.flash('success', '修改成功');
            return res.redirect('/users')
        })
        .catch(e => {
            req.flash('error', e.message);
            return res.redirect('/users');
            next(e);
        })
})

module.exports = router;
