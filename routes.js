const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { Teacher, Student, Topic, Apply } = require('./models');

// 文件上传配置
const upload = multer({ dest: 'uploads/' });

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
    console.log('req body' , req.body);
    const { student_id, student_name,  teacher_id, teacher_name, topic_id, topic_title } = req.body;
    const apply = await Apply.create({
      student_id,
      student_name,
      teacher_id,
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
router.put('/apply/:id', async (req, res) => {
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
    const students = await Student.findAll({include: [Teacher]});
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取毕设题目列表
router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.findAll({
      include: [Teacher]
    });
    res.json({ success: true, data: topics });
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

module.exports = router;