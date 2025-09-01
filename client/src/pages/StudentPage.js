import React, { useState, useEffect } from 'react';
import { Table, Tabs, Tag, message, Button, Input } from 'antd';
import { topicApi, applyApi } from '../api';
// import { Navigate } from 'react-router-dom';

const { TabPane } = Tabs;

const StudentPage = () => {
  const [activeKey, setActiveKey] = useState('topics');
  const [topics, setTopics] = useState([]);
  const [applies, setApplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');

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
      setTopics(res || []);
    } catch (error) {
      message.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplies = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await applyApi.getAppliesByStudent(user.userno);
      setApplies(res || []);
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



  // 修改后的handleApply方法
  const handleApply = async (record) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const studentNo = user?.userno;
      const studentName = user?.username;
      
      // 确保获取最新申请记录
      const latestApplies = await applyApi.getAppliesByStudent(studentNo);
      
      // 检查是否已有非拒绝状态的申请
      const hasActiveApply = latestApplies.some(a => {
        console.log('handleApply', a.student_no, studentNo, studentName);
        console.log('hasActiveApply', a.student_no === studentNo && a.status !== 'REJECTED');
        return a.student_no === studentNo && a.status !== 'REJECTED';
      });
      
      if (hasActiveApply) {
        message.warning('你已有一个正在处理中的申请，请等待审批结果');
        return;
      }
      
      const { id: topicId, teacher = {}} = record;
      const teacherNo = teacher?.teacher_no;
      const teacherName = teacher?.name;
      
      await topicApi.applyTopic(
        topicId,
        teacherNo,
        studentNo,
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

  const   isTopicDisabled = (record) => {
    // const topic = topics.find(t => t.id === topicId);
    return record?.apply_status === 'PENDING' || record?.apply_status === 'APPROVED';
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
          disabled={isTopicDisabled(record)}
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
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="筛选老师姓名"
              value={teacherFilter}
              onChange={e => setTeacherFilter(e.target.value)}
              style={{ width: 200, marginRight: 8 }}
            />
            <Input
              placeholder="筛选题目"
              value={titleFilter}
              onChange={e => setTitleFilter(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
          <Table 
            columns={topicColumns} 
            dataSource={topics.filter(topic => {
              const matchesTeacher = teacherFilter === '' || 
                (topic.teacher?.name || '').toLowerCase().includes(teacherFilter.toLowerCase());
              const matchesTitle = titleFilter === '' || 
                (topic.title || '').toLowerCase().includes(titleFilter.toLowerCase());
              return matchesTeacher && matchesTitle;
            })} 
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