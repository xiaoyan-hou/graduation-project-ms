const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// 初始化Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'graduation_project',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    define: { freezeTableName: true }, // 全部用模型名本身
    logging: false
  }
);

// 用户表
const User = sequelize.define('user', {
  // Sequelize 模型片段
  userno: {
    type: DataTypes.STRING(20),
    allowNull: false,
    // unique: true,
    comment: '全局唯一账号编号'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  vx: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  role: {
    // type: DataTypes.ENUM('admin', 'teacher', 'student'),
    type: DataTypes.STRING(100),
    defaultValue: 'student'
  }
}, {
  timestamps: true
});

// 角色表
const Role = sequelize.define('role', {
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    // unique: true
  },
  name: {
    type: DataTypes.STRING(30)
  }
}, {
  timestamps: false
});

// 用户角色关联表
const UserRole = sequelize.define('user_role', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role_id']
    }
  ]
});

// 权限表， 简化rabc模型只使用用户和角色
// const Permission = sequelize.define('permission', {
//   code: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//     unique: true
//   },
//   name: {
//     type: DataTypes.STRING(100)
//   }
// }, {
//   timestamps: false
// });

// 角色权限关联表
// const RolePermission = sequelize.define('role_permission', {
//   role_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   permission_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   }
// }, {
//   timestamps: false,
//   indexes: [
//     {
//       unique: true,
//       fields: ['role_id', 'permission_id']
//     }
//   ]
// });

// 角色数据范围表
// const RoleDataScope = sequelize.define('role_data_scope', {
//   role_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   scope_type: {
//     type: DataTypes.ENUM('ALL', 'OWN', 'DEPT'),
//     allowNull: false
//   },
//   scope_value: {
//     type: DataTypes.STRING(100)
//   }
// }, {
//   timestamps: false,
//   indexes: [
//     {
//       unique: true,
//       fields: ['role_id', 'scope_type']
//     }
//   ]
// });

// 定义关联关系
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

// Role.belongsToMany(Permission, { through: RolePermission });
// Permission.belongsToMany(Role, { through: RolePermission });

// Role.hasOne(RoleDataScope);
// RoleDataScope.belongsTo(Role);


// 定义教师模型
const Teacher = sequelize.define('teacher', {
  teacher_no: {
    type: DataTypes.CHAR(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  research: {
    type: DataTypes.STRING(200)
  }
}, {
    tableName: 'teacher',   // 强制单数
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['teacher_no']
      }
    ]
});

// 定义学生模型
const Student = sequelize.define('student', {
  student_no: {
    type: DataTypes.CHAR(12),
    allowNull: false,
    // unique: true
  },
  name: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('男', '女'),
    allowNull: false
  },
  major: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  class: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  graduation_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});



// 定义毕设题目模型
const Topic = sequelize.define('topic', {
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  teacher_no: {
    type: DataTypes.CHAR(20),
    allowNull: false
  }
}, {
  timestamps: false
});

// 定义申请模型
const Apply = sequelize.define('apply', {
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING'
    },
    apply_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    topic_id:   { type: DataTypes.INTEGER, allowNull: false },
    student_name: { type: DataTypes.CHAR(30), allowNull: false },
    teacher_name: { type: DataTypes.CHAR(30), allowNull: false },
    topic_title:   { type: DataTypes.STRING(200), allowNull: false }
  }, {
    timestamps: false
  });

// 定义关联关系
Teacher.hasMany(Student, { foreignKey: 'teacher_id' });
Student.belongsTo(Teacher, { foreignKey: 'teacher_id' });

Teacher.hasMany(Topic, { foreignKey: 'teacher_no', sourceKey: 'teacher_no' });
Topic.belongsTo(Teacher, {
    foreignKey: {
        name: 'teacher_no',
        allowNull: false
    },
    targetKey: 'teacher_no',
    onDelete: 'CASCADE'
});

Student.hasMany(Apply, { foreignKey: 'student_id' });
Apply.belongsTo(Student, { foreignKey: { name: 'student_id', allowNull: false }, onDelete: 'CASCADE' });

Teacher.hasMany(Apply, { foreignKey: 'teacher_id' });
Apply.belongsTo(Teacher, { foreignKey: 'teacher_id' });

Topic.hasMany(Apply, { foreignKey: 'topic_id' });
Apply.belongsTo(Topic, { foreignKey: 'topic_id' });

// 同步数据库
sequelize.sync({ alter: true })
  .then(() => console.log('数据库模型已同步'))
  .catch(err => console.error('数据库同步错误:', err));

// 密码加密钩子
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// 密码验证方法
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 生成JWT方法
User.prototype.generateAuthToken = function() {
  return jwt.sign({ id: this.id }, process.env.SESSION_SECRET, { expiresIn: '1d' });
};

module.exports = {
  sequelize,
  User,
  Role,
  // Permission,
  UserRole,
  // RolePermission,
  // RoleDataScope,
  Teacher,
  Student,
  Topic,
  Apply
};




// Example query to get teacher with roles
// const teacherWithRoles = await Teacher.findOne({
//   where: { teacher_no: 'T001' },
//   include: [{
//     model: Role,
//     through: { attributes: [] } // Hide join table attributes
//   }]
// });