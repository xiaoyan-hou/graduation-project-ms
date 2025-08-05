import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { topicApi } from '../api';

const { getTopics, applyTopic } = topicApi;
const StudentPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const topicsRes = await getTopics();
      console.log(topicsRes);
      setTopics(topicsRes.data.data);
    } catch (error) {
      message.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (record) => {
    try {
      
      const { id: topicId, title: topicTitle, teacher } = record;
      // 从localStorage中获取教师信息
      const { id: teacherId, name: teacherName } = teacher;
      // 从localStorage中获取学生信息   
    //   const studentId = localStorage.getItem('studentId');
    //   const studentName = localStorage.getItem('studentName');
      const studentId = 4;
      const studentName = '解梦莹';
      await applyTopic(topicId, teacherId, studentId, studentName, teacherName, topicTitle);
      message.success('申请成功');
      // 直接更新本地状态而不是重新获取数据
      setTopics(topics.map(topic => 
        topic.id === topicId ? { ...topic, applied: true } : topic
      ));
    } catch (error) {
      message.error('申请失败');
    }
  };

  // 表格列配置保持不变
  const columns = [
    {
      title: '题目名称',
      dataIndex: 'title',
      key: 'title',
      width: 350,
    },
    {
      title: '指导教师',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      width: 150,
    },
    {
      title: '研究方向',
      dataIndex: ['teacher', 'research'],
      key: 'research',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleApply(record)}
          disabled={record.applied}
        >
          {record.applied ? '已申请' : '申请'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>毕设题目列表</h2>
      <Table 
        columns={columns} 
        dataSource={topics} 
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default StudentPage;