const xlsx = require('xlsx');
const { Topic } = require('../models');

(async () => {
  // 读取Excel文件
  const workbook = xlsx.readFile('/Users/qy/Desktop/data/topic.xlsx');
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const topics = xlsx.utils.sheet_to_json(worksheet);

  // 批量导入题目
  for (const topic of topics) {
    await Topic.create({
      title: topic.title,
      summary: topic.summary,
      teacher_no: topic.teacher_no
    });
  }
  
  console.log(`成功导入${topics.length}条毕设题目数据`);
})();