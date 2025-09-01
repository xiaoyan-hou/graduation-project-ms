// const bcrypt = require('bcryptjs');
const { Student } = require('../models');

(async () => {
  await Student.create({
    student_no: 'test',
    name: 'test',
    gender: '男',
    major : '电子信息工程',
    class : '电子2201',
    graduation_year: '2026',
    password: 'test',
    role: 'student'
  });
  console.log('学生账号创建成功');
})();