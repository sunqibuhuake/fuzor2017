var express = require('express');
var router = express.Router();
var ModelModel = require('../models/model')

router.get('/', function(req, res, next) {
    ModelModel.getSharingModels(null, null)
    .then((models) => {
        console.log(models)

        var arr = models.map(model => {
            return model
        })

        res.render('xdiscover', {
            last: models,
            collection: arr.sort((a,b) => {
                return b - a
            }).slice(0,8)
        })
    }).catch(e => {
        next(e)
    })
});


module.exports = router;
