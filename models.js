const { Sequelize, DataTypes } = require('sequelize');
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
    timestamps: false
});

// 定义学生模型
const Student = sequelize.define('student', {
  student_no: {
    type: DataTypes.CHAR(12),
    allowNull: false,
    unique: true
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

// 修改同步配置为不自动修改表结构
sequelize.sync()
  .then(() => console.log('数据库模型已同步'))
  .catch(err => console.error('数据库同步错误:', err));

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

module.exports = {
  Teacher,
  Student,
  Topic,
  Apply
};

// 1. 基础角色模型
const Role = sequelize.define('role', {
  name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(200) }
}, { timestamps: false });

// 2. 权限模型（功能级）
const Permission = sequelize.define('permission', {
  code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  type: { type: DataTypes.ENUM('MENU', 'BUTTON', 'API'), allowNull: false },
  resource: { type: DataTypes.STRING(200) } // 关联资源路径
}, { timestamps: false });

// 3. 数据权限模型
const DataScope = sequelize.define('data_scope', {
  type: { 
    type: DataTypes.ENUM('ALL', 'DEPARTMENT', 'SELF'), 
    allowNull: false 
  },
  customSql: { type: DataTypes.TEXT } // 自定义数据过滤SQL
}, { timestamps: false });

// 4. 用户-角色关联
const UserRole = sequelize.define('user_role', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false });

// 5. 角色-权限关联
const RolePermission = sequelize.define('role_permission', {
  roleId: { type: DataTypes.INTEGER, allowNull: false },
  permissionId: { type: DataTypes.INTEGER, allowNull: false },
  dataScopeId: { type: DataTypes.INTEGER } // 数据级权限控制
}, { timestamps: false });

// 定义关联关系
// Replace User references with Teacher/Student polymorphic associations
Role.belongsToMany(Teacher, { through: 'teacher_roles' });
Role.belongsToMany(Student, { through: 'student_roles' });
Teacher.belongsToMany(Role, { through: 'teacher_roles' });
Student.belongsToMany(Role, { through: 'student_roles' });

Role.belongsToMany(Permission, { through: RolePermission });
Permission.belongsToMany(Role, { through: RolePermission });
RolePermission.belongsTo(DataScope, { foreignKey: 'dataScopeId' });

// 初始化基础角色
const initRoles = async () => {
  await Role.bulkCreate([
    { name: 'admin', description: '系统管理员' },
    { name: 'teacher', description: '指导教师' },
    { name: 'student', description: '学生' }
  ]);
};


// Example query to get teacher with roles
// const teacherWithRoles = await Teacher.findOne({
//   where: { teacher_no: 'T001' },
//   include: [{
//     model: Role,
//     through: { attributes: [] } // Hide join table attributes
//   }]
// });