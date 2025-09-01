// setRoles.js
const { User, UserRole, Role } = require('../models'); // Sequelize 模型

(async () => {
  // 1. 查用户
  const user = await User.findOne({ where: { userno: '20240111' } });
  if (!user) throw new Error('用户不存在');

  // 2. 查 teacher 和 admin 的 role_id
  const roles = await Role.findAll({
    where: { code: ['teacher', 'admin'] }
  });
  if (roles.length !== 2) throw new Error('角色数据不完整');

  // 3. 插入关联（忽略已存在）
  await UserRole.bulkCreate(
    roles.map(r => ({ user_id: user.id, role_id: r.id })),
    { ignoreDuplicates: true }
  );

  console.log('已将 20240111 设为 teacher + admin');
})();