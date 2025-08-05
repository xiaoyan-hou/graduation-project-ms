import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag } from 'antd';
import { applyApi } from '../api';

const TeacherPage = () => {
  const [applies, setApplies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApplies();
  }, []);

  const fetchApplies = async () => {
    setLoading(true);
    try {
      const data = await applyApi.getApplies();
      setApplies(data);
    } catch (error) {
      message.error('获取申请列表失败');
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
        <div>
          <Button 
            type="link" 
            onClick={() => handleApprove(record.id)}
            disabled={record.status !== 'PENDING'}
          >
            通过
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => handleReject(record.id)}
            disabled={record.status !== 'PENDING'}
          >
            拒绝
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>学生申请列表</h2>
      <Table 
        columns={columns} 
        dataSource={applies} 
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default TeacherPage;