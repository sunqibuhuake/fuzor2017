/**
 * Created by sunqi on 16/11/18.
 */
var express = require('express');
var router = express.Router();
var ModelModel = require('../models/model')
var FavModel = require('../models/fav')

router.get('/', function (req, res, next) {

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
    .catch(e => {
        next(e)
    })

})

module.exports = router;
