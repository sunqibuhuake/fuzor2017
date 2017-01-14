/**
 * Created by sunqi on 16/11/27.
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

var ViewModel = require('../models/view')

var AttachmentModel = require('../models/attachment')

router.get('/:modelId', (req, res, next ) => {

    var modelId = req.params.modelId.split('#')[0]

    console.log(modelId)

    if(!modelId) {
        res.end()
    }

    Promise.all([
        ModelModel.getModelById(modelId),
        ViewModel.getView(modelId)
    ])
    .then(result => {

        const model = result[0]
        let arr = []
        if(model.data && model.data.data && model.data.data.length) {
            arr = model.data.data
        }
        const list = {}
        arr.forEach(obj => {

            //console.log(obj['标高'] + obj['族'] + obj['族与类型'])

            if(obj['标高'] && obj['族'] && obj['族与类型']) {

                //console.log(obj);

                const a = obj['标高']

                const b = obj['族']

                const c = obj['族与类型']

                if(!list[a]) {

                    list[a] = {}
                }

                if(!list[a][b]) {

                    list[a][b] = []

                }

                list[a][b].push({
                    name: c,
                    objectid: obj.__fuzor_objectid
                })
            }
        })
        delete model.data

        const views = result[1]

        res.render('xpanel', {
            list: list,
            model: model,
            views: views
        })
    })
    .catch(next)
})

router.get('/detail/:modelId/:objectId', (req, res, next) => {


    const modelId = req.params.modelId

    const objectId = req.params.objectId

    Promise.all([
        ModelModel.getModelById(modelId),
        AttachmentModel.getAttachment(modelId, objectId),
    ])
    .then(result => {

        const model = result[0]

        const attachments = result[1]

        const filtered = []

        if(model.data) {
            const arr = model.data.data
            arr.forEach(obj => {

                if(obj['__fuzor_objectid'] == objectId) {

                    filtered.push(obj)

                }

            })

        }



        res.json({
            status: 'success',
            message: '请求成功',
            data: {
                info: filtered[0],
                attachments: attachments,
                fuzor: {
                    focusObject: `focusobject=__fuzor_objectid:${objectId}&__fuzor_objectid:${objectId}`,
                }
            }
        })
    })
    .catch(e => {
        res.json({
            status: 'error',
            message: '网络错误',
            error: e.message
        })
    })

})

router.post('/upload/attachment', (req, res, next) => {

    var attach = req.body;

    var extension = attach.file.match(/\.(\w+)$/);

    console.log(extension)

    attach.type = (extension && extension.length && extension.length > 0) ? extension[0] : 'unknown'

    attach.date = new Date();

    AttachmentModel.create(attach)
        .then(function (result) {
            //var a = result.ops[0];
            //res.json( {
            //    status: 'success',
            //    message: '上传成功'
            //})
            res.redirect('back')
        })
        .catch(next);
})

router.post('/upload/view', (req, res, next) => {

    var view = req.body;

    ViewModel.create(view)
        .then(function (result) {
            res.redirect('back')
            //var a = result.ops[0];
            //res.json( {
            //    status: 'success',
            //    message: '上传成功'
            //})
        })
        .catch(next);

})


module.exports = router