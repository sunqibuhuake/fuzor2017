/**
 * Created by sunqi on 16/11/15.
 */
var Model = require('../lib/mongo').Model

var CatModel = require('./cat')

var SubCatModel = require('./subCat')

Model.plugin('getCatName', {
    afterFind: function (models) {
        return Promise.all(models.map(function (model) {
            return CatModel.getCatById(model.cat).then(function (cat) {
                model.catName = cat.name;

                if(model.data) {
                    model.hasData = true
                } else {
                    model.hasData = false
                }
                return model;
            });
        }));
    },
    afterFindOne: function (model) {
        if (model) {
            return CatModel.getCatById(model.cat).then(function (cat) {
                model.catName = cat.name;
                if(model.data) {
                    model.hasData = true
                } else {
                    model.hasData = false
                }
                return model;
            });
        }
        return model;
    }
});

Model.plugin('getSubCatName', {
    afterFind: function (models) {
        return Promise.all(models.map(function (model) {
            return SubCatModel.getSubCatById(model.subcat).then(function (subcat) {
                model.subcatName = subcat.name;
                return model;
            });
        }));
    },
    afterFindOne: function (model) {
        if (model) {
            return SubCatModel.getSubCatById(model.subcat).then(function (subcat) {
                model.subcatName = subcat.name;
                return model;
            });
        }
        return model;
    }
});

Model.plugin('getCollectCount', {
    afterFind: function (models) {
        var FavModel = require('./fav.js')
        return Promise.all(models.map(function (model) {
            return FavModel.getCollectionByModelId(model._id).then(function (collection) {
                model.collectionCount = collection.length;
                return model;
            });
        }));
    },
    afterFindOne: function (model) {
        if (model) {
            var FavModel = require('./fav.js')
            return FavModel.getCollectionByModelId(model._id).then(function (model) {
                model.collectionCount = collection.length;
                return model;
            });
        }
        return model;
    }
})


module.exports = {
    create: function create(model) {
        return Model.create(model).exec()
    },
    getModels: function getModels() {
        return Model
            .find({})
            .getCatName()
            .getSubCatName()
            .exec();
    },
    getModelsByCat: function getModelsByCat(sid) {
        return Model
            .find({ subcat: sid})
            .getCatName()
            .getSubCatName()
            .exec()
    },
    getModelsByAuthorId: function getModelsByAuthorId(authorId) {
        return Model
            .find({authorId: authorId})
            .exec();
    },
    getModelById: function getModelById(id) {
        return Model
            .findOne({_id: id})
            .getCatName()
            .getSubCatName()
            .exec();
    },
    getSharingModelsByUserId: function (userId) {

        return Model.find({
            authorId: userId,
            share: 'yes'
        }).exec()
    },
    getSharingModels: function (cat, subcat) {

        var query = {
            share: 'yes'
        }

        if (cat) {
            query.cat = cat;
        }

        if (subcat) {
            query.subcat = subcat
        }

        return Model
            .find(query)
            //.getCatName()
            .getCollectCount()
            .exec()

    },
    share: function share(modelId) {
        return Model.update({_id: modelId}, {$set: {share: 'yes'}}).exec();

    },
    noShare: function noShare(modelId) {
        return Model.update({_id: modelId}, {$set: {share: 'no'}}).exec();
    },
    delModelById: function delModelById(modelId) {
        return Model.remove({_id: modelId}).exec();
    },
    findModelsByModelIdArr: function findModelsByModelIdArr(arr) {
        return Model.find({
                _id: {
                    $in: arr
                }
            })
            .exec()
    },

    updateModelById: function updateModelById(modelId, data) {
        return Model.update({_id: modelId}, {$set: data}).exec();
    }
}