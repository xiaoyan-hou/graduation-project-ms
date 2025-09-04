import React, { useState, useEffect } from 'react';
import { Table, Button, message, Tag, Flex, Tabs } from 'antd';
import { applyApi, topicApi } from '../api';
import moment from 'moment';

const TeacherPage = () => {
  const [applies, setApplies] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('topics');

  const user = JSON.parse(localStorage.getItem('user'));
  const isTeacher = user?.role === 'teacher' || (Array.isArray(user?.role) && user?.role.includes('teacher'));
  
  useEffect(() => {
    if (isTeacher) {
      // fetchApplies();
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


  // const fetchApplies = async () => {
  //   setLoading(true);
  //   try {
  //     const apppliesRes = await applyApi.getApplies();
  //     console.log('teacher page apppliesRes', apppliesRes);
  //     setApplies(apppliesRes);
  //   } catch (error) {
  //     message.error('获取申请列表失败');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await topicApi.getTopicsByTeacher(user.userno);
      // console.log('teacher page getTopicsByTeacher', res);
      
      const processedTopics = res.map(topic => {
        if (!topic.applies || topic.applies.length === 0) return topic;
        
        let apply = null;
        if (topic.applies.length === 1) {
          apply = topic.applies[0];
        } else {
          apply = topic.applies.find(a => a.status !== 'REJECTED') || topic.applies[0];
        }
        
        return {
          ...topic,
          applyStatus: apply.status,
          applyStudent: apply.student_name,
          applyStudentClass: apply.student_class,
          applyTime: apply.apply_time,
          applies: topic.applies
        };
      });
      
      setTopics(processedTopics);
    } catch (error) {
      message.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const approvedCount = topics.filter(t => t.applies?.some(a => a.status === 'APPROVED')).length;
      const maxStudents = topics[0]?.teacher?.max_students || 0;
      
      console.log('approvedCount', approvedCount);
      console.log('maxStudents', maxStudents);
      
      if (maxStudents > 0 && approvedCount >= maxStudents) {
        message.error(`已达到最大指导学生数${maxStudents}人，无法再批准`);
        return;
      }
      
      await applyApi.updateApply(id, { status: 'APPROVED' });
      message.success('已通过申请');
      // fetchApplies();
      fetchTopics();
    } catch (error) {
      message.error('通过申请操作失败');
    }
  };

  const handleReject = async (id) => {
    try {
      console.log('reject id', id);
      await applyApi.updateApply(id, { status: 'REJECTED' });
      message.success('已拒绝申请');
      // fetchApplies();
      fetchTopics();
    } catch (error) {
      message.error('拒绝申请操作失败');
    }
  };

  // const columns = [
  //   {
  //     title: '学生姓名',
  //     dataIndex: ['student', 'name'],
  //     key: 'student',
  //   },
  //   {
  //     title: '题目名称',
  //     dataIndex: ['topic', 'title'],
  //     key: 'topic',
  //   },
  //   {
  //     title: '申请时间',
  //     dataIndex: 'apply_time',
  //     key: 'apply_time',
  //   },
  //   {
  //     title: '状态',
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (status) => {
  //       let color = '';
  //       if (status === 'APPROVED') color = 'green';
  //       else if (status === 'REJECTED') color = 'red';
  //       else color = 'orange';
  //       return <Tag color={color}>{status}</Tag>;
  //     },
  //   },
  //   {
  //     title: '操作',
  //     key: 'action',
  //     render: (_, record) => (
  //       <Flex gap="small" wrap>
  //         <Button 
  //           type="primary"
  //           onClick={() => handleApprove(record.id)}
  //           disabled={record.status !== 'PENDING'}
  //         >
  //           通过
  //         </Button>
  //         <Button 
  //           type="primary"
  //           danger
  //           onClick={() => handleReject(record)}
  //           disabled={record.status !== 'PENDING'}
  //         >
  //           拒绝
  //         </Button>
  //       </Flex>
  //     ),
  //   },
  // ];

  const topicColumns = [
    {
      title: '题目名称',
      dataIndex: 'title',
      key: 'title',
    },
    // {
    //   title: '描述',
    //   dataIndex: 'summary',
    //   key: 'summary',
    // },
    {
      title: '申请学生',
      dataIndex: ['applies', '0', 'student_name'],
      key: 'student_name',
      render: (_, record) => (
        record.applies?.length > 0 ? record.applies[0].student_name : '暂无申请'
      ),
    },
    {
      title: '学生班级',
      dataIndex: ['applies', '0', 'student_class'],
      key: 'student_class',
      render: (_, record) => (
        record.applies?.length > 0 ? record.applies[0].student_class : '暂无申请'
      ),
    },
    {
      title: '申请时间',
      dataIndex: ['applies', '0', 'apply_time'],
      key: 'apply_time',
      render: (_, record) => (
        record.applies?.length > 0 ? moment(record.applies[0].apply_time).format('YYYY-MM-DD HH:mm') : '暂无申请'
      ),
    },
    {
      title: '申请状态',
      dataIndex: ['applies', '0', 'status'],
      key: 'status',
      render: (status, record) => {
        if (!record.applies?.length) return '暂无申请';
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
            onClick={() => handleApprove(record.applies?.[0]?.id)}
            disabled={!record.applies?.length || record.applies[0].status !== 'PENDING'}
          >
            通过
          </Button>
          <Button 
            type="primary" 
            danger
            onClick={() => handleReject(record.applies?.[0]?.id)}
            disabled={!record.applies?.length || record.applies[0].status !== 'PENDING'}
          >
            拒绝
          </Button>
          {/* <Button type="primary">编辑</Button>
          <Button type="primary" danger>删除</Button> */}
        </Flex>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        {/* <Tabs.TabPane tab="学生申请列表" key="applies">
          <Table 
            columns={columns} 
            dataSource={applies} 
            rowKey="id"
            loading={loading}
          />
        </Tabs.TabPane> */}
        <Tabs.TabPane tab="我的毕设题目" key="topics">
          <div style={{ marginBottom: 16 }}>
            <p>您需要指导的学生数为{topics[0]?.teacher?.max_students || 0}，当前已同意{topics.filter(t => t.applies?.some(a => a.status === 'APPROVED')).length}个</p>
          </div>
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