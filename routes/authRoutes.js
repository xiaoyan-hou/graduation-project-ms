const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 用户登录
router.post('/login', authController.login, (req, res) => {
    console.log(req.user, res.user);
    res.json({ message: '登录成功', user: req.user  });
  });

// 需要认证的路由示例
router.get('/profile', 
  authController.authMiddleware(), 
  (req, res) => {
    res.json({ user: req.user });
  }
);

// 需要特定权限的路由示例
router.get('/admin', 
  authController.authMiddleware(['admin']), 
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);

module.exports = router;