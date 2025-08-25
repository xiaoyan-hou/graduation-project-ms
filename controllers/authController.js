const { User, Role, Permission, UserRole, RolePermission } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// 用户登录
const login = async (req, res) => {
  try {
    const { userno, password } = req.body;
    // 验证用户是否存在
    const user = await User.findOne({ 
      where: { userno },
    //   include: [{
    //     model: Role,
    //     through: { attributes: [] },
    //     include: [{
    //       model: Permission,
    //       through: { attributes: [] }
    //     }]
    //   }]
    });

    console.log('controller user', user);
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    console.log('controller isMatch', isMatch, password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT
    const token = user.generateAuthToken();
    
    // 获取用户权限列表
    // const permissions = [];
    // user.Roles.forEach(role => {
    //   role.Permissions.forEach(permission => {
    //     if (!permissions.includes(permission.code)) {
    //       permissions.push(permission.code);
    //     }
    //   });
    // });

    res.status(200).json({ 
      token,
      user: {
        id: user.id,
        userno: user.userno,
        username: user.username,
        role: user.role
      },
    //   permissions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 权限验证中间件
const authMiddleware = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // 获取token
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: '请先登录' });
      }

      // 验证token
      const decoded = jwt.verify(token, process.env.SESSION_SECRET);
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          through: { attributes: [] },
        //   include: [{
        //     model: Permission,
        //     through: { attributes: [] }
        //   }]
        }]
      });

      if (!user) {
        return res.status(401).json({ message: '用户不存在' });
      }

      // 检查权限
    //   const userPermissions = [];
    //   user.Roles.forEach(role => {
    //     role.Permissions.forEach(permission => {
    //       if (!userPermissions.includes(permission.code)) {
    //         userPermissions.push(permission.code);
    //       }
    //     });
    //   });

      // 验证是否有足够权限
    //   if (requiredPermissions.length > 0) {
    //     const hasPermission = requiredPermissions.every(permission => 
    //       userPermissions.includes(permission)
    //     );
        
    //     if (!hasPermission) {
    //       return res.status(403).json({ message: '权限不足' });
    //     }
    //   }

      // 将用户信息附加到请求对象
      req.user = user;
    //   req.permissions = userPermissions;
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: '无效的token' });
    }
  };
};

// 数据范围过滤
const dataScopeFilter = (model, scopeField = 'user_id') => {
  return async (req, res, next) => {
    try {
      // 获取用户角色数据范围
      const roleDataScope = await RoleDataScope.findOne({
        where: { role_id: req.user.Roles[0].id }
      });

      // 根据数据范围类型过滤查询条件
      let where = {};
      switch(roleDataScope.scope_type) {
        case 'OWN':
          where[scopeField] = req.user.id;
          break;
        case 'DEPT':
          // 这里需要根据实际业务实现部门过滤逻辑
          break;
        // ALL类型不需要额外过滤
      }

      req.dataScopeWhere = where;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '数据范围过滤错误' });
    }
  };
};

module.exports = {
  login,
  authMiddleware,
  dataScopeFilter
};