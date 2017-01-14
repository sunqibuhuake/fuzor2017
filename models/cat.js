/**
 * Created by sunqi on 16/11/15.
 */
var Cat = require('../lib/mongo').Cat

var SubCatModel = require('./subCat')

Cat.plugin('getSubCat', {
    afterFind: function (cats) {
        return Promise.all(cats.map(function (cat) {
            return SubCatModel.getSubCats(cat._id).then(function (subcats) {
                cat.subcats = subcats;
                return cat;
            });
        }));
    }
})

module.exports = {
    create: function create(cat) {
        return Cat.create(cat).exec()
    },
    getCats: function getCats() {
        return Cat
            .find({})
            .getSubCat()
            .exec();
    },
    getCatById: function getCatById(id) {
        return Cat
            .findOne({ _id: id })
            .exec();
    },
    update: function update(id,name) {
        return Cat.update({_id: id}, {$set: {name: name}}).exec();
    }
}