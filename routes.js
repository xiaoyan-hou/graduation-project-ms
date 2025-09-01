const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { Teacher, Student, Topic, Apply, User } = require('./models');
const authRoutes = require('./routes/authRoutes');

// 文件上传配置
const upload = multer({ dest: 'uploads/' });

// 挂载认证路由
router.use('/auth', authRoutes);

// 批量导入教师
router.post('/teachers/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const teachers = xlsx.utils.sheet_to_json(worksheet);
    console.log(teachers);
    await Teacher.bulkCreate(teachers);
    console.log('导入成功');
    res.json({ success: true, message: '教师信息导入成功' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量导入学生
router.post('/students/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const students = xlsx.utils.sheet_to_json(worksheet);
    
    await Student.bulkCreate(students);
    res.json({ success: true, message: '学生信息导入成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 批量导入毕设题目
router.post('/topics/import', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const topics = xlsx.utils.sheet_to_json(worksheet);
    
    await Topic.bulkCreate(topics);
    res.json({ success: true, message: '毕设题目导入成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 学生申请毕设题目
router.post('/apply', async (req, res) => {
  try {
    // console.log('req body' , req.body);
    const { student_no, student_name,  teacher_no, teacher_name, topic_id, topic_title } = req.body;
    const apply = await Apply.create({
      student_no,
      student_name,
      teacher_no,
      teacher_name,
      topic_id,
      topic_title,
      status: 'PENDING' // 默认状态为待处理
    });
    res.json({ success: true, data: apply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 教师处理申请
router.post('/apply/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const apply = await Apply.findByPk(req.params.id);
    
    if (!apply) {
      return res.status(404).json({ success: false, message: '申请记录不存在' });
    }
    
    apply.status = status;
    await apply.save();
    
    // 如果批准，更新学生指导教师
    if (status === 'APPROVED') {
      const student = await Student.findByPk(apply.student_id);
      student.teacher_id = apply.teacher_id;
      await student.save();
    }
    
    res.json({ success: true, data: apply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新教师最多指导学生数
router.post('/teachers/:teacherNo/max-students', async (req, res) => {
  try {
    const { teacherNo } = req.params;
    const { max_students } = req.body;
    
    const teacher = await Teacher.findOne({ where: { teacher_no: teacherNo } });
    if (!teacher) {
      return res.status(404).json({ success: false, message: '教师不存在' });
    }
    
    teacher.max_students = max_students;
    await teacher.save();
    
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取教师列表
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取学生列表
router.get('/students', async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        Teacher,
        {
          model: Apply,
          attributes: ['status', 'teacher_name', 'teacher_no'],
          required: false
        }
      ]
    });
    console.log('get studnets',students[students.length-1].applies[0]);
    const studentsWithStatus = students.map(student => {
      const applyStatus = student.applies && student.applies.length > 0 
        ? student.applies[0].status === 'APPROVED' ? 'completed' : 'pending'
        : 'none';
      
      return {
        ...student.toJSON(),
        apply_status: applyStatus
      };
    });
    
    res.json({ success: true, data: studentsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取教师所有题目
router.get('/topics/teacher/:teacherNo', async (req, res) => {
  try {
    const { teacherNo } = req.params;
    const topics = await Topic.findAll({
      where: { teacher_no: teacherNo },
      include: [
        Teacher,
        {
          model: Apply,
          attributes: ['id' ,'status', 'student_name', 'apply_time'],
          required: false
        }
      ]
    });
    
    const topicsWithStatus = topics.map(topic => {
      const applyStatus = topic.applies && topic.applies.length > 0 
        ? topic.applies[0].status 
        : 'NONE';
      
      return {
        ...topic.toJSON(),
        apply_status: applyStatus
      };
    });
    
    res.json({ success: true, data: topicsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取毕设题目列表
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [
        Teacher,
        {
          model: Apply,
          attributes: ['status'],
          required: false
        }
      ]
    });
    
    const topicsWithStatus = topics.map(topic => {
      const applyStatus = topic.applies && topic.applies.length > 0 
        ? topic.applies[0].status 
        : 'NONE';
      
      return {
        ...topic.toJSON(),
        apply_status: applyStatus
      };
    });
    
    res.json({ success: true, data: topicsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取申请列表
router.get('/applies', async (req, res) => {
  try {
    const applies = await Apply.findAll({
      include: [Student, Teacher, Topic]
    });
    res.json({ success: true, data: applies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取学生申请列表
router.get('/applies/student/:studentNo', async (req, res) => {
  try {
    const { studentNo } = req.params;
    const applies = await Apply.findAll({
      where: { student_no: studentNo },
      include: [Teacher, Topic]
    });
    res.json({ success: true, data: applies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新用户信息
router.post('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
  console.log('userData', userData, userId);

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    await user.update(userData);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 修改密码
router.post('/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: '旧密码不正确' });
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新用户角色
router.post('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    await user.update({ role });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;