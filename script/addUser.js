// addUser.js
const bcrypt = require('bcryptjs');
const { User } = require('../models');   // 指向你的 Sequelize 模型文件

// (async () => {
//   await User.create({
//     userno: '20250111',
//     username: 'test',
//     password: '240111',  //bcrypt.hashSync('240111', 10),
//     role: 'teacher'              // 如需教师/管理员改成 'teacher' / 'admin'
//   });
//   console.log('账号创建成功');
// })();

(async () => {
  await User.create({
    userno: 'test',
    username: 'test',
    password: 'test',  //bcrypt.hashSync('240111', 10),
    role: 'student'              // 如需教师/管理员改成 'teacher' / 'admin'
  });
  console.log('账号创建成功');
})();
