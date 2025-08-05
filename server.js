const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const xlsx = require('xlsx');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接配置
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'graduation_project'
});

// 连接数据库
db.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('成功连接到MySQL数据库');
});

// 设置文件上传
const upload = multer({ dest: 'uploads/' });

// 导入路由
const apiRoutes = require('./routes');

// 使用路由
app.use('/api', apiRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});