// addUser.js
const bcrypt = require('bcryptjs');
const { User } = require('./models');   // 指向你的 Sequelize 模型文件

(async () => {
  await User.create({
    userno: '20240111',
    username: '侯情缘',
    password: '240111',  //bcrypt.hashSync('240111', 10),
    role: 'teacher'              // 如需教师/管理员改成 'teacher' / 'admin'
  });
  console.log('账号创建成功');
})();