/**
 * Created by sunqi on 16/11/15.
 */
module.exports = {
    port: 8864,
    session: {
        secret: 'fuzor',
        key: 'fuzor',
        maxAge: 2592000000
    },
    qiniu: {
        AK: 'mFDhC6laiQQRF_zOIx2QgPQTTeFAr1Km9JkgFPjQ',
        SK: 'tQtEFWToRwywlRUJelKZ1QA1dbiAHOl8N3IBOG7N',
        bucket: 'fuzor'
    },
    mongodb: 'mongodb://localhost:27017/fuzor'
};