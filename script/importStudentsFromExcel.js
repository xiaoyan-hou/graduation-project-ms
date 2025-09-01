const xlsx = require('xlsx');
const { Student } = require('../models');

(async () => {
  // 读取Excel文件
  const workbook = xlsx.readFile('/Users/qy/Desktop/data/student.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const students = xlsx.utils.sheet_to_json(worksheet);

  // 批量导入学生
  for (const student of students) {
    await Student.create({
      student_no: student.student_no,
      name: student.name,
      gender: student.gender,
      major: student.major,
      class: student.class,
      graduation_year: student.graduation_year
    });
  }
  
  console.log(`成功导入${students.length}条学生数据`);
})();