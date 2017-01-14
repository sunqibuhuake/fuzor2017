var Fav = require('../lib/mongo').Fav

Fav.plugin('getModelDetail', {
    afterFind: function (favs) {

        var ModelModel = require('./model');
        return ModelModel.findModelsByModelIdArr(favs.map(fav => {
            return fav.modelId
        })).then(models => {
            return models
        })
    }
})

module.exports = {
    detect: function (fav) {
        return Fav.find(fav).exec()
    },
    create: function create(fav) {
        return Fav.create(fav).exec()
    },
    remove: function (fav) {

        return Fav.remove(fav).exec()

    },
    getCollectionByUserId: function (userId) {
        return Fav
            .find({userId: userId})
            .getModelDetail()
            .exec();
    },
    getCollectionByModelId: function (modelId) {

        return Fav
            .find({modelId: modelId})
            .exec()

    },
    getCatById: function getCatById(id) {
        return Cat
            .findOne({_id: id})
            .exec();
    }
}
