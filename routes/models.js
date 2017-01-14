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

var AttachmentModel = require('../models/attachment.js');

var ViewModel = require('../models/view.js');

var ModelModel = require('../models/model')
var FavModel = require('../models/fav')


/*
 * 用户原创上传模型
 * */

router.get('/', (req, res, next) => {

    res.redirect('/models/cat/all')

})

router.get('/cat', (req, res, next) => {

    res.redirect('/models/cat/all')

})
router.get('/cat/all', (req, res, next) => {

    //var userId = req.session.user._id;

    ModelModel.getModels()
        .then(function (models) {
            res.render('xmodels', {
                models: models
            })
        })
        .catch(function (e) {
            next(e);
        });
})

router.get('/cat/:catId', (req, res, next) => {

    var catId = req.params.catId

    ModelModel.getModelsByCat(catId)
        .then(function (models) {
            res.render('xmodels', {
                models: models
            })
        })
        .catch(function (e) {
            next(e);
        });
})


router.post('/save', (req, res, next) => {

    console.log(req.body)

    var modelId = req.body.model_id;

    var data = JSON.parse(req.body.data);

    ModelModel.updateModelById(modelId, {data: data})
        .then(function () {
            res.redirect('back')
        }).catch(next)

    //
    //var userId = req.session.user._id;
    //
    //ModelModel.getModelsByAuthorId(userId)
    //    .then(function (models) {
    //        res.render('xmodels', {
    //            origin: models
    //        })
    //    })
    //    .catch(function (e) {
    //        next(e);
    //    });

})

/*
 * 单个模型详情
 * */
router.get('/:modelId', (req, res, next) => {

    var modelId = req.params.modelId

    console.log(modelId)

    Promise.all([
            ModelModel.getModelById(modelId),
            AttachmentModel.getAttachment(modelId),
            ViewModel.getView(modelId)
        ])
        .then(result => {

            const model = result[0]

            delete model.data

            const attachments = result[1]

            console.log(model, attachments)

            res.render('xmodel', {
                model: model,
                attachments: attachments,
                views: result[2]
            })

        })
        .catch((e) => {
            next(e)
        })
})

router.get('/modify/:modelId', (req, res, next) => {

    var modelId = req.params.modelId

    res.render('xmodify', {
        modelId: modelId
    })

})

router.post('/modify/:modelId', (req, res, next) => {

    var modelId = req.params.modelId

    var setContent = {}

    const model = req.body.model;

    if(model) {

        setContent.model = model;
    }

    const snap = req.body.snap;

    if(snap) {

        setContent.snap = snap;
    }

    ModelModel.updateModelById(modelId, setContent)
    .then(()=> {
        res.redirect(`/models/${modelId}`);
    })
    .catch(next)

})


router.get('/panel/:modelId', (req, res, next) => {

    var modelId = req.params.modelId

    ModelModel.getModelById(modelId)
        .then(function (model) {
            res.render('xmodelpanel', {
                model: model
            })
        })
        .catch((e) => {
            next(e)
        })

})

/*
 * 分享模型
 * */
router.get('/:modelId/share', (req, res, next) => {

    var modelId = req.params.modelId

    ModelModel.share(modelId)
        .then(function (model) {
            res.redirect('back')
        })
        .catch((e) => {
            next(e)
        })

})


/*
 * 取消分享
 * */
router.get('/:modelId/noshare', (req, res, next) => {

    var modelId = req.params.modelId

    ModelModel.noShare(modelId)
        .then(function (model) {
            res.redirect('back')
        })
        .catch((e) => {
            next(e)
        })

})


/*
 * 删除模型
 * */

router.get('/:modelId/delete', function (req, res, next) {

    var modelId = req.params.modelId

    ModelModel.delModelById(modelId)
        .then(function () {
            res.redirect('/models')
        })
        .catch((e) => {
            next(e)
        })

})

router.get('/:modelId/collect', function (req, res, next) {

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

router.get('/:modelId/discollect', function (req, res, next) {
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

router.get('/collection', (req, res, next) => {

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

