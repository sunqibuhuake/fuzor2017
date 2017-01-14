/**
 * Created by sunqi on 16/11/20.
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

router.get('/', (req, res, next) => {

    const userId = req.session.user._id;

    ModelModel.getModelsByAuthorId(userId)
    .then(models => {
        res.render('xprofile', {
            origin: models
        })
    })
    .catch(next)

})

module.exports = router;