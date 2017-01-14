/**
 * Created by sunqi on 16/12/4.
 */
var path = require('path');
var express = require('express');

var qn = require('../common/qiniu.js')

var router = express.Router();


router.post('/cb', function(req, res, next) {

    console.log(req.body)

    res.json({
        cb: req.body
    })

});

router.get('/token', function(req, res, next) {
    res.json({
        uptoken: qn('che')
    })
})

module.exports = router;