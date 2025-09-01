// seedRole.js
const { Role } = require('../models'); // Role 对应你的 Sequelize 模型

(async () => {
  const roles = [
    { code: 'admin',   name: '管理员' },
    { code: 'teacher', name: '指导教师' },
    { code: 'student', name: '学生' }
  ];
  await Role.bulkCreate(roles, { ignoreDuplicates: true });
  console.log('角色数据已初始化');
})();