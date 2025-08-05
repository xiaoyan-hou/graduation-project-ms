exports.applyTopic = async (req, res) => {
  const { student_id, teacher_id, topic_id, student_name, teacher_name, topic_title } = req.body;
  
  try {
    // 检查是否已申请过该题目
    const existingApply = await Apply.findOne({
      where: { student_id, topic_id }
    });
    
    if(existingApply) {
      return res.status(400).json({ message: '您已经申请过该题目' });
    }
    
    // 创建新的申请记录
    const newApply = await Apply.create({
      student_id,
      teacher_id,
      topic_id,
      student_name,
      teacher_name,
      topic_title,
      status: 'PENDING'
    });
    
    res.status(201).json({
      message: '申请提交成功',
      data: newApply
    });
    
  } catch(err) {
    res.status(500).json({ 
      message: '申请提交失败',
      error: err.message 
    });
  }
};