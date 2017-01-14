/**
 * Created by sunqi on 16/11/18.
 */
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var UserModel = require('../models/users');
var CatModel = require('../models/cat');
var SubCatModel = require('../models/subCat');
var ModelModel = require('../models/model')
var FavModel = require('../models/fav')
var checkAdmin = require('../middlewares/check.js').checkAdmin

/*
* 管理导航
* */
router.get('/', checkAdmin,function (req, res, next) {
    res.render('xmanage')
})
/*
* 用户管理
* */
router.get('/users',function (req, res, next) {

    UserModel.getUsers()
        .then(function (users) {
            res.render('xuserList', {
                users: users
            })
        })
})

router.get('/models',function (req, res, next) {

    ModelModel.getModels()
    .then((models) => {
        res.render('xmodelmanagement', {
            models: models
        })
    })
    .catch(next)
})
router.get('/addUser', function (req, res, next) {
    res.render('xaddUser');
});

router.get('/deleteUser/:userId',checkAdmin, function (req, res, next) {

    const userId = req.params.userId;

    UserModel.deleteUserById(userId)
    .then((result) => {
        res.redirect('/management/users')
    })
    .catch(next)

});
router.post('/addUser', function (req, res, next) {

    var name = req.body.name;
    var password = req.body.password;
    var repassword = req.body.repassword;
    var authority = req.body.authority;
    var nickname = req.body.nickname;
    var avatar = req.body.avatar;

    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (password < 3) {
            throw new Error('密码至少 3 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
        if (['a', 'b', 'c'].indexOf(authority) === -1) {
            throw new Error('权限设置错误');
        }
    } catch (e) {

        console.log(e)
        req.flash('error', e.message);
        return res.redirect('back');
    }
    // 明文密码加密
    password = sha1(password);

    var user = {
        name: name,
        nickname: nickname,
        avatar: avatar ? avatar : 'avatar.jpg',
        password: password,
        gender: 'x',
        bio: 'nothing',
        authority: authority
    };

    UserModel.create(user)
        .then(function (result) {
            user = result.ops[0];
            delete user.password;
            req.flash('success', '注册成功');
            res.redirect('/management/users');
        })
        .catch(function (e) {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                return res.redirect('back');
            }
            next(e);
        });
})

/*
* 分类管理
* */
router.get('/cat',checkAdmin, function (req, res, next) {

    CatModel.getCats()
        .then(function (cats) {

            res.render('xcat', {
                cats: cats
            })

        })

})
router.get('/subcat/:parentId',checkAdmin, function (req, res, next) {

    var parentId = req.params.parentId

    Promise.all([
            CatModel.getCatById(parentId),
            SubCatModel.getSubCats(parentId)
        ])
        .then(function (result) {

            var cat = result[0]


            var subcats = result[1]

            res.render('xsubcat', {
                subcats: subcats,
                cat: cat,
                parentId: parentId
            })

        })

})
router.post('/subcat',checkAdmin, function (req, res, next) {

    var name = req.body.name;
    var parentId = req.body.parentId;

    var subcat = {
        name: name,
        parentId: parentId
    }

    SubCatModel.create(subcat)
        .then(function (result) {
            console.log(result)
            // 此 user 是插入 mongodb 后的值，包含 _id
            c = result.ops[0];
            req.flash('success', '添加成功');
            // 跳转到首页
            res.redirect('back');
        })
        .catch(function (e) {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '名称重复');
                return res.redirect('back');
            }
            next(e);
        });
})
router.post('/addCat', function (req, res, next) {

    var cat = req.body;

    let Model;
    if(cat.pid) {
        Model = SubCatModel
    } else {

        Model = CatModel
    }

    Model.create(cat)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            c = result.ops[0];
            req.flash('success', '添加成功');
            // 跳转到首页
            res.redirect('back');
        })
        .catch(function (e) {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '名称重复');
                return res.redirect('back');
            }
            next(e);
        });
})


router.post('/modify/cat', function(req, res, next) {

    var name = req.body.name

    var cid = req.body.cid

    var sbid = req.body.sbid;



    if(cid) {

        CatModel.update(cid,name)
        .then(function(){

            res.redirect('back')
        })
        .catch(next)
    } else {

        SubCatModel.update(sbid,name)
            .then(function(){
                res.redirect('back')
            })
            .catch(next)
    }

})


module.exports = router;
