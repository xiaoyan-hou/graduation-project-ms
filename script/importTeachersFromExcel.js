const xlsx = require('xlsx');
const { Teacher } = require('../models');

(async () => {
  // 读取Excel文件
  const workbook = xlsx.readFile('/Users/qy/Desktop/data/teacher.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const teachers = xlsx.utils.sheet_to_json(worksheet);

  // 批量导入教师
  for (const teacher of teachers) {
    await Teacher.create({
      teacher_no: teacher.teacher_no,
      name: teacher.name,
      title: teacher.title,
      department: teacher.department,
      research: teacher.research || null
    });
  }
  
  console.log(`成功导入${teachers.length}条教师数据`);
})();