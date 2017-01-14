/**
 * Created by sunqi on 16/12/4.
 */
const config = require('../config/default.js')
var qiniu = require("qiniu");

//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = config.qiniu.AK;
qiniu.conf.SECRET_KEY = config.qiniu.SK;

//要上传的空间
bucket = config.qiniu.bucket;


function uptoken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket);
    putPolicy.callbackUrl = '120.24.237.212:8864/qiniu/cb';
    putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
    return putPolicy.token();
}

function getToken(ext) {

    const key = (Math.random() + '').split('.')[1] + '.' + ext;

    const token = uptoken(bucket, key);

    return token

}

module.exports = getToken