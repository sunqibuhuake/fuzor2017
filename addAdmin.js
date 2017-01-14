var sha1 = require('sha1');
var UserModel = require('./models/users');

var user = {
    name: 'admin001',
    password: '123456',
    gender: 'x',
    avatar: 'avatar.jpg',
    bio: 'nothing',
    authority: 'a',
    nickname: '初始账号'
};

user.password = sha1(user.password);


UserModel.create(user)
    .then(function (result) {

        console.log('添加成功')

    })
    .catch(function (e) {
        console.log('出现错误');
        if (e.message.match('E11000 duplicate key')) {
            console.log('用户名已被占用');
        }
    });