
/**
 * Created by sunqi on 16/11/15.
 */
var SubCat = require('../lib/mongo').SubCat



module.exports = {
    create: function create(subCat) {
        return SubCat.create(subCat).exec()
    },
    getSubCats: function getSubCats(pid) {
        return SubCat
            .find({ pid: pid })
            .formatDate()
            .sort({ _id: 1 })
            .exec();
    },
    getSubCatById: function getSubCatById(id) {
        return SubCat
            .findOne({ _id: id })
            .exec();
    },
    getAllSubCats: function() {
        return SubCat
            .find({})
            .sort({ _id: 1 })
            .exec();
    },
    update: function update(id,name) {
        return SubCat.update({_id: id}, {$set: {name: name}}).exec();
    }
}