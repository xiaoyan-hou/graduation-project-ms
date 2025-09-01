const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

(async () => {
  // 读取Excel文件
//   const workbook = xlsx.readFile('/Users/qy/Desktop/data/user-teacher.xlsx');
const workbook = xlsx.readFile('/Users/qy/Desktop/data/user-student.xlsx');

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const users = xlsx.utils.sheet_to_json(worksheet);

  // 批量导入用户
  for (const user of users) {
    // console.log('user', user);
    await User.create({
      userno: user.userno,
      username: user.username,
      password: user.password, // bcrypt.hashSync(user.password, 10),
      role: user.role || 'student'
    });
  }
  
  console.log(`成功导入${users.length}条用户数据`);
})();