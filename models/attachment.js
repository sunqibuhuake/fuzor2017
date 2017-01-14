/**
 * Created by sunqi on 16/11/27.
 */

var Attachment = require('../lib/mongo').Attachment

function getFileSize(bytes) {

    if(!bytes) return 0;

    bytes = parseInt(bytes);

    if(isNaN(bytes)) return bytes;

    if(bytes > 1024*1024) {
        return (bytes/1024/1024).toFixed(2) + 'mb'
    }

    return Math.floor(bytes/1024) + 'kb'

}

function getFileType(extension) {
    var type = ''
    try {
        type = extension.match(/\w+$/)[0]
    } catch (err) {
        type = '未知'
    }
    return type
}
function getFileLogo(extension) {

    var fileType = getFileType(extension);

    switch(fileType) {
        case 'jpeg' :
        case 'jpg'  :
        case 'png'  :
            return '/filetype/pic.png'
        case 'mp4'  :
            return '/filetype/video.png'
        case 'pdf'  :
            return '/filetype/pdf.png'
        case 'zip'  :
            return '/filetype/zip.png'
        case 'ppt'  :
            return '/filetype/ppt.png'
        case 'audio':
            return '/filetype/audio.png'
        case 'excel':
            return '/filetype/excel.png'
    }

    return '/filetype/default.png'

}

Attachment.plugin('getLogoImg', {
    afterFind: function (files) {
        return Promise.all(files.map(function (file) {

            file.logo = getFileLogo(file.type + '')

            file.size = getFileSize(file.size - 0)

            return file

        }));
    },
    afterFindOne: function (file) {

        file.logo = getFileLogo(file.type + '')

        file.size = getFileSize(file.size - 0)

        return file
    }
});


module.exports = {
    create: function create(attachment) {
        return Attachment.create(attachment).exec()
    },
    getAllAttachments: function getAttachments() {
        return Attachment
            .find({})
            .exec();
    },
    getAttachment: function getAttachment(modelId, objectId) {
        
        const query = {}
        
        if(modelId) {
            query.modelId = modelId
        }

        if(objectId) {
            query.objectId = objectId
        }

        console.log(query)

        return Attachment
            .find(query)
            .formatDate()
            .getLogoImg()
            .exec();
    },
    getAttachmentById: function getAttachmentById(id) {
        return Attachment
            .findOne({ _id: id })
            .exec();
    },

    delModelById:  function delModelById(modelId) {
        return Model.remove({_id: modelId}).exec();
    },

    updateModelById: function updateModelById(modelId, data) {
        return Model.update({ _id: modelId }, { $set: data }).exec();
    }
}