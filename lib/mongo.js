var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

mongolass.plugin('formatDate', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.date = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD');
    });
    return results;
  },
  afterFindOne: function (result) {
    if (result) {
      result.date = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD');
    }
    return result;
  }
});



exports.User = mongolass.model('User', {
  name: { type: 'string' },
  nickname: { type: 'string' },
  role: {type: 'string',enum: ['admin', 'viewer']},
  password: { type: 'string' },
  avatar: { type: 'string' },
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId },
  title: { type: 'string' },
  content: { type: 'string' },
  pv: { type: 'number' }
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' },
  postId: { type: Mongolass.Types.ObjectId }
});

/*
* 分类模型
* */

exports.Cat = mongolass.model('Cat', {
  name: {type: 'string'}
})
exports.Cat.index({ name: 1 }, { unique: true }).exec();
exports.SubCat = mongolass.model('SubCat', {
  name: {type: 'string'},
  pid: { type: Mongolass.Types.ObjectId }
})
exports.SubCat.index({ name: 1 }, { unique: true }).exec();

exports.Model = mongolass.model('Model', {
  name: {type: 'string'},
  date: {type: 'date'},
  data: {type: 'object'},
  pv: {type: 'number'},
  intro: {type: 'string'},
  authorId: { type: Mongolass.Types.ObjectId },
  author: {type: 'string'},
  cat: { type: Mongolass.Types.ObjectId },
  subcat: { type: Mongolass.Types.ObjectId },
  share: {type: 'string'},
  model: {type: 'string'},
  snap: {type: 'string'}
})

exports.Fav = mongolass.model('Fav', {
  userId: { type: Mongolass.Types.ObjectId },
  modelId: { type: Mongolass.Types.ObjectId },
  name: {type: 'string'}
})


exports.Attachment = mongolass.model('Attachment', {
  modelId: { type: Mongolass.Types.ObjectId },
  objectId: {type: 'string'},
  name: {type: 'string'},
  intro: {type: 'string'},
  size: {type: 'string'},
  file: {type: 'string'},
  originName: {type: 'string'},
  date: {type: 'date'},
  type: {type: 'string'}
})

exports.View = mongolass.model('View', {
  modelId: { type: Mongolass.Types.ObjectId },
  objectId: {type: 'string'},
  name: {type: 'string'},
  pos: {type: 'string'},
  dir: {type: 'string'},
  vertical: {type: 'string'},
  horizontal: {type: 'string'},
  img: {type: 'string'}
})
//exports.Fav.index({ name: 1 }, { unique: true }).exec();



exports.Post.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Post.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言
