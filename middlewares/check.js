var CatModel = require('../models/cat')
var SubCatModel = require('../models/subCat')

module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.redirect('/login');
        }
        next();
    },

    checkCats: function checkCats(req, res, next) {
        CatModel.getCats()
            .then(function (cats) {
                req.session.cats = cats;
                next()
            })
    },

    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录');
            return res.redirect('/');//返回之前的页面
        }
        next();
    },

    checkAdmin: function checkAdmin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '请先登录');
            return res.redirect('/login');
        }

        if (req.session.user.role !== 'admin') {
            req.flash('error', '您不是管理员');
            return res.redirect('back');
        }
        next();
    }
};
