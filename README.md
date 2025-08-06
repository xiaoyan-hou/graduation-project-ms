# 毕业设计管理系统

## 项目概述

本系统是一个基于React和Ant Design构建的毕业设计管理系统，包含学生、教师和管理员三种角色，实现毕设题目管理、申请审核等功能。

## 功能特点

- **多角色登录**：学生、教师、管理员
- **题目管理**：管理员发布毕设题
- **申请系统**：学生申请题目，教师审批
- **数据统计**：管理员查看各类统计报表

## 技术栈

- 前端：React 18, Ant Design 5, React Router 6
- 后端：Node.js, Express
- 数据库：mysql

## 安装与运行

### 前端

1. 进入client目录
```bash
cd client
```
2. 安装依赖
```bash
npm install
```
3. 启动开发服务器
```bash
npm start
```

### 后端

1. 安装依赖
```bash
npm install
```
2. 启动服务
```bash
npm run server
```

## 配置

1. 复制.env.example为.env
2. 修改数据库连接等配置

## 贡献

欢迎提交Pull Request或Issue报告问题。