/**
 * Created by sunqi on 16/11/15.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var ModelModel = require('../models/model')
var fs = require('fs');


router.get('/', (req, res, next) => {

    res.render('xupload')

})
router.post('/', function (req, res, next) {

    //TODO 增加验证
    var model = req.body;

    model.authorId = req.session.user._id;

    model.author = req.session.user.nickname;

    console.log(model)

    ModelModel.create(model)
        .then(function (result) {

            console.log('添加模型成功');

            req.flash('success', '添加成功');

            res.redirect('/models');

        })
        .catch(function (e) {

            console.log(e.message);

            next(e);
        });


})


router.post('/model', function (req, res, next) {
    var fileName = '';
    var filePath = '';
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    //store all uploads in the /uploads directory
    form.uploadDir = ('./public/models');

    form.keepExtensions = true;

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function (field, file) {

        fileName = file.path.split('/').pop();

        filePath = file.path;

        console.log(file.path)

        //fs.rename(file.path, path.join(form.uploadDir, file.name));

    });

    // log any errors that occur
    form.on('error', function (err) {

        console.log('An error has occured: \n' + err);
        res.json({
            status: 'error',
            file: ''
        })
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {

        console.log('上传成功')

        res.json({
            status: 'success',
            file: fileName
        })
    });

    // parse the incoming request containing the form data
    form.parse(req);

});

router.post('/img', function (req, res, next) {
    var fileName = '';
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    //store all uploads in the /uploads directory
    form.uploadDir = ('./public/img');

    form.keepExtensions = true;

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function (field, file) {

        fileName = file.path.split('/').pop()

        console.log(file.path)

        //fs.rename(file.path, path.join(form.uploadDir, file.name));

    });

    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
        res.json({
            status: 'error',
            file: ''
        })
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {

        res.json({
            status: 'success',
            file: fileName
        })

    });

    // parse the incoming request containing the form data
    form.parse(req);

});

router.post('/attachment', function (req, res, next) {
    var fileName = '';
    var filePath = '';
    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;

    //store all uploads in the /uploads directory
    form.uploadDir = ('./public/attachments');

    form.keepExtensions = true;

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function (field, file) {


        fileName = file.path.split('/').pop();

        filePath = file.path;

        console.log(file.path)

        //fs.rename(file.path, path.join(form.uploadDir, file.name));

    });

    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
        res.json({
            status: 'error',
            file: ''
        })
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function () {

        console.log('上传成功')

        res.json({
            status: 'success',
            file: fileName
        })
    });

    // parse the incoming request containing the form data
    form.parse(req);

});


module.exports = router;
