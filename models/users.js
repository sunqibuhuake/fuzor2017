var User = require('../lib/mongo').User;

module.exports = {
    // 创建
    create: function create(user) {
        return User.create(user).exec();
    },

    //删除
    deleteUserById: function (userId) {
        return User.remove({
            _id: userId
        }).exec()
    },

    // 登录时通过用户名获取用户信息
    getUserByName: function getUserByName(name) {
        return User
            .findOne({ name: name })
            .addCreatedAt()
            .exec();
    },


    //查询所有
    getUsers: function getUsers() {
        return User
            .find({})
            .sort({_id: -1})
            .addCreatedAt()
            .exec();
    },

    //更新
    updateUserById: function (userId, user) {
        return User.update({_id: userId}, {
            $set: {user}
        }).exec()
    }
}
