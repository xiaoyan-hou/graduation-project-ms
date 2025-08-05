

import React, { useState, useEffect } from 'react';
import { applyApi, teacherApi, studentApi, topicApi } from '../api';
import { Table, Card, Button, Upload, message, Tabs } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const AdminPage = () => {
  const [activeKey, setActiveKey] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [applies, setApplies] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTabData = async (key) => {
    setLoading(true);
    try {
      switch (key) {
        case 'teachers':
          const teachersRes = await teacherApi.getTeachers();
          console.log('teachersRes', teachersRes.data);
          setTeachers(teachersRes.data || []);
          break;
        case 'students':
          const studentsRes = await studentApi.getStudents();
          setStudents(studentsRes.data || []);
          break;
        case 'topics':
          const topicsRes = await topicApi.getTopics();
          setTopics(topicsRes.data || []);
          break;
        case 'applies':
          const appliesRes = await applyApi.getApplies();
          setApplies(appliesRes.data || []);
          break;
      }
    } catch (error) {
      console.error(`获取${key}数据失败:`, error);
      message.error(`获取${key}数据失败`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData(activeKey);
  }, [activeKey]);

  const handleImport = async (type, file) => {
    try {
      let response;
      if (type === 'teacher') {
        response = await teacherApi.importTeachers(file);
      } else if (type === 'student') {
        response = await studentApi.importStudents(file);
      } else if (type === 'topic') {
        response = await topicApi.importTopics(file);
      }
      message.success('导入成功');
      loadTabData(activeKey);
      return response;
    } catch (error) {
      message.error('导入失败');
      throw error;
    }
  };

  const teacherColumns = [
    { title: '教师编号', dataIndex: 'teacher_no', key: 'teacher_no' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '职称', dataIndex: 'title', key: 'title' },
  ];

  const studentColumns = [
    { title: '学号', dataIndex: 'student_no', key: 'student_no' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '班级', dataIndex: 'class', key: 'class' },
  ];

  const topicColumns = [
    { title: '题目ID', dataIndex: 'id', key: 'id' },
    { title: '题目名称', dataIndex: 'title', key: 'title' },
    { title: '指导教师', dataIndex: 'teacher_name', key: 'teacher_name' },
  ];

  const applyColumns = [
    { title: '学生姓名', dataIndex: 'student_name', key: 'student_name' },
    { title: '教师姓名', dataIndex: 'teacher_name', key: 'teacher_name' },
    { title: '题目名称', dataIndex: 'topic_title', key: 'topic_title' },
    { title: '申请状态', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="教师管理" key="teachers">
          <Card 
            extra={
              <Upload 
                beforeUpload={(file) => handleImport('teacher', file)}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>导入教师</Button>
              </Upload>
            }
          >
            <Table 
              columns={teacherColumns} 
              dataSource={teachers} 
              loading={loading}
              rowKey="teacher_no"
            />
          </Card>
        </TabPane>
        <TabPane tab="学生管理" key="students">
          <Card 
            extra={
              <Upload 
                beforeUpload={(file) => handleImport('student', file)}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>导入学生</Button>
              </Upload>
            }
          >
            <Table 
              columns={studentColumns} 
              dataSource={students} 
              loading={loading}
              rowKey="student_no"
            />
          </Card>
        </TabPane>
        <TabPane tab="题目管理" key="topics">
          <Card 
            extra={
              <Upload 
                beforeUpload={(file) => handleImport('topic', file)}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>导入题目</Button>
              </Upload>
            }
          >
            <Table 
              columns={topicColumns} 
              dataSource={topics} 
              loading={loading}
              rowKey="id"
            />
          </Card>
        </TabPane>
        <TabPane tab="申请列表" key="applies">
          <Card>
            <Table 
              columns={applyColumns} 
              dataSource={applies} 
              loading={loading}
              rowKey="id"
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminPage;