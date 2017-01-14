/**
 * Created by sunqi on 16/11/15.
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


router.get('/dashboard', function (req, res, next) {

    const userId = req.session.user._id;

    Promise.all([
        ModelModel.getModelsByAuthorId(userId),
        FavModel.getCollectionByUserId(userId),
        ModelModel.getSharingModelsByUserId(userId)
    ]).then(function (result) {

        const origin = result[0];

        const collection = result[1];

        const sharing = result[2]

        res.render('xdashboard', {
            origin: origin.length,
            collection: collection.length,
            sharing: sharing.length,
            last: origin.splice(0, 6)
        })
    })

})

router.get('/addUser', function (req, res, next) {
    res.render('xaddUser');
});
router.get('/users', function (req, res, next) {

    UserModel.getUsers()
        .then(function (users) {
            res.render('xuserList', {
                users: users
            })
        })
})

router.get('/cat', function (req, res, next) {

    CatModel.getCats()
        .then(function (cats) {
            res.render('xcat', {
                cats: cats
            })
        })

})

router.get('/manage', function (req, res, next) {

    res.render('xmanage')
})

router.get('/subcat/:parentId', function (req, res, next) {

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

router.post('/subcat', function (req, res, next) {

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

router.get('/models', function (req, res, next) {

    var userId = req.session.user._id;

    ModelModel.getModelsByAuthorId(userId)
        .then(function (models) {
            res.render('xmodels', {
                origin: models

            })
        })
        .catch(function (e) {

            next(e);
        });

})

router.get('/collection', function (req, res, next) {

    var userId = req.session.user._id;

    FavModel.getCollectionByUserId(userId)
        .then(function (models) {
            res.render('xcollection', {
                collection: models
            })
        })
        .catch(e => {
            next(e)
        })
})

router.get('/discover', function (req, res, next) {

    ModelModel.getSharingModels(null, null)
        .then(function (models) {
            res.render('xdiscover', {
                models: models
            })
        })

})

router.get('/collect/:modelId', function (req, res, next) {
    var userId = req.session.user._id;
    var modelId = req.params.modelId;

    var fav = {
        userId: userId,
        modelId: modelId
    }
    FavModel.detect(fav)
        .then(function (result) {
            if (result.length == 0) {
                FavModel.create(fav)
                    .then(function (result2) {
                        res.redirect('back');
                    })
                    .catch(function (e) {
                        console.log(e.message)
                        next(e)
                    })
            } else {
                res.redirect('back');

            }
        })
        .catch(function (e) {
            console.log(e.message)
            next(e)

        })
})
router.get('/discollect/:modelId', function (req, res, next) {
    var userId = req.session.user._id;
    var modelId = req.params.modelId;

    var fav = {
        userId: userId,
        modelId: modelId
    }
    FavModel.remove(fav)
        .then(function (result) {
            res.redirect('back')
        })
        .catch(function (e) {
            console.log(e.message)
            next(e)
        })
})

router.get('/model/:modelId', function (req, res, next) {

    var modelId = req.params.modelId

    ModelModel.getModelById(modelId)
        .then(function (model) {

            res.render('xmodel', {
                model: model
            })
        })
})

router.get('/share/:modelId', function (req, res, next) {

    var modelId = req.params.modelId

    ModelModel.share(modelId)
        .then(function (model) {
            res.redirect('/admin/models')
        })

})

router.get('/noshare/:modelId', function (req, res, next) {

    var modelId = req.params.modelId

    ModelModel.noShare(modelId)
        .then(function (model) {
            res.redirect('/admin/models')
        })

})

router.get('/delete/:modelId', function (req, res, next) {

    var modelId = req.params.modelId

    ModelModel.delModelById(modelId)
        .then(function () {
            res.redirect('/admin/models')
        })

})

router.post('/cat', function (req, res, next) {
    var name = req.body.name;
    var cat = {
        name: name
    }

    console.log(name)

    CatModel.create(cat)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            c = result.ops[0];
            req.flash('success', '添加成功');
            // 跳转到首页
            res.redirect('/admin/cat');
        })
        .catch(function (e) {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '名称重复');
                return res.redirect('/admin/cat');
            }
            next(e);
        });
})
router.post('/addUser', function (req, res, next) {

    var name = req.fields.name;
    var password = req.fields.password;
    var repassword = req.fields.repassword;
    var authority = req.fields.authority;

    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字请限制在 1-10 个字符');
        }
        if (password < 6) {
            throw new Error('密码至少 6 个字符');
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
        return res.redirect('/admin/addUser');
    }
    // 明文密码加密
    password = sha1(password);

    var user = {
        name: name,
        password: password,
        gender: 'x',
        bio: 'nothing',
        authority: authority
    };

    UserModel.create(user)
        .then(function (result) {

            console.log(result)

            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // 将用户信息存入 session
            delete user.password;
            req.session.user = user;

            req.flash('success', '注册成功');
            // 跳转到首页
            res.redirect('/admin');

        })
        .catch(function (e) {
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                return res.redirect('/admin/addUser');
            }
            next(e);
        });
})

router.get('/uploadModel', function (req, res, next) {
    res.render('xupload')
})

router.post('/uploadModel', function (req, res, next) {

    //TODO 增加验证
    var model = req.body;

    model.authorId = req.session.user._id;

    model.author = req.session.user.name;

    ModelModel.create(model)
        .then(function (result) {
            req.flash('success', '添加成功');
            // 跳转到首页
            res.redirect('/admin/models');

        })
        .catch(function (e) {
            next(e);
        });


})
module.exports = router;
