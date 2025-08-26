import React, { useState, useEffect } from 'react';
import { Table, Tabs, Tag, message, Button } from 'antd';
import { topicApi, applyApi } from '../api';
// import { Navigate } from 'react-router-dom';

const { TabPane } = Tabs;

const StudentPage = () => {
  const [activeKey, setActiveKey] = useState('topics');
  const [topics, setTopics] = useState([]);
  const [applies, setApplies] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const isStudent = user?.role === 'student' || (Array.isArray(user?.role) && user?.role.includes('student'));
  
  useEffect(() => {
    isStudent && loadTabData(activeKey);
  }, [activeKey, isStudent]);

  if (!isStudent) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>权限不足</h2>
        <p>你不是学生，没有权限访问该页面</p>
      </div>
    );
  }
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await topicApi.getTopics();
      setTopics(res.data || []);
    } catch (error) {
      message.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplies = async () => {
    setLoading(true);
    try {
      const res = await applyApi.getApplies();
      setApplies(res.data || []);
    } catch (error) {
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = (key) => {
    if (key === 'topics') fetchTopics();
    else if (key === 'applies') fetchApplies();
  };



  const handleApply = async (record) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const studentId = user?.id;
      const studentName = user?.username;
      
      // const topicId = record.id;
      const { id: topicId,  teacher = {}} = record;
      const { id: teacherId, name: teacherName } = teacher;
      // console.log('apply record', record);  
      await topicApi.applyTopic(
        topicId,
        teacherId,
        studentId,
        studentName,
        teacherName,
        topics.find(t => t.id === topicId)?.title || ''
      );
      message.success('申请成功');
      fetchApplies();
    } catch (error) {
      message.error(error.message || '申请失败');
    }
  };

  const topicColumns = [
    { 
        title: '指导教师', 
        dataIndex: 'teacher_name', // 或 teacher.name
        key: 'teacher_name',
        width: 150,
        render: (_, record) => record.teacher?.name || '--'
    },
    { title: '题目名称', dataIndex: 'title', key: 'title', width: 400 },
    { title: '简介', dataIndex: 'summary', key: 'summary' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button 
          type="primary"
          onClick={() => handleApply(record)}
          disabled={applies.some(a => a.topic_id === record.id)}
        >
          申请
        </Button>
      ),
    },
  ];

  const applyColumns = [
    { title: '题目名称', dataIndex: 'topic_title', key: 'topic_title' },
    { title: '指导教师', dataIndex: 'teacher_name', key: 'teacher_name' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: status => {
        let color = status === 'APPROVED' ? 'green' : 
                   status === 'REJECTED' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { 
        title: '申请时间', 
        dataIndex: 'apply_time', 
        key: 'apply_time',
        render: date => new Date(date).toLocaleString()
     },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="毕设题目" key="topics">
          <Table 
            columns={topicColumns} 
            dataSource={topics} 
            loading={loading}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="我的申请" key="applies">
          <Table 
            columns={applyColumns} 
            dataSource={applies} 
            loading={loading}
            rowKey="id"
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StudentPage;