import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Flex, Tabs } from 'antd';
import { applyApi, topicApi } from '../api';

const TeacherPage = () => {
  const [applies, setApplies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('applies');

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher' || (Array.isArray(user?.role) && user?.role.includes('teacher'));
  
  useEffect(() => {
    if (isTeacher) {
      fetchApplies();
      fetchTopics();
    }
  }, [isTeacher]);

  if (!isTeacher) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>权限不足</h2>
        <p>你不是教师，没有权限访问该页面</p>
      </div>
    );
  }


  const fetchApplies = async () => {
    setLoading(true);
    try {
      const apppliesRes = await applyApi.getApplies();
      setApplies(apppliesRes.data);
    } catch (error) {
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await topicApi.getTopicsByTeacher(user.id);
      setTopics(res.data || []);
    } catch (error) {
      message.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await applyApi.updateApply(id, { status: 'APPROVED' });
      message.success('已批准申请');
      fetchApplies();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReject = async (id) => {
    try {
      await applyApi.updateApply(id, { status: 'REJECTED' });
      message.success('已拒绝申请');
      fetchApplies();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '学生姓名',
      dataIndex: ['student', 'name'],
      key: 'student',
    },
    {
      title: '题目名称',
      dataIndex: ['topic', 'title'],
      key: 'topic',
    },
    {
      title: '申请时间',
      dataIndex: 'apply_time',
      key: 'apply_time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        if (status === 'APPROVED') color = 'green';
        else if (status === 'REJECTED') color = 'red';
        else color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Flex gap="small" wrap>
          <Button 
            type="primary"
            onClick={() => handleApprove(record.id)}
            disabled={record.status !== 'PENDING'}
          >
            通过
          </Button>
          <Button 
            type="primary"
            danger
            onClick={() => handleReject(record.id)}
            disabled={record.status !== 'PENDING'}
          >
            拒绝
          </Button>
        </Flex>
      ),
    },
  ];

  const topicColumns = [
    {
      title: '题目名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Flex gap="small" wrap>
          <Button type="primary">编辑</Button>
          <Button type="primary" danger>删除</Button>
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <Tabs.TabPane tab="学生申请列表" key="applies">
          <Table 
            columns={columns} 
            dataSource={applies} 
            rowKey="id"
            loading={loading}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="我的毕设题目" key="topics">
          <Table 
            columns={topicColumns} 
            dataSource={topics} 
            rowKey="id"
            loading={loading}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default TeacherPage;