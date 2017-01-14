var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var UserModel = require('../models/users');
var CatModel = require('../models/cat');
var SubCatModel = require('../models/subCat');
var ModelModel = require('../models/model')
var FavModel = require('../models/fav')

router.get('/', (req, res, next) => {

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

module.exports = router

