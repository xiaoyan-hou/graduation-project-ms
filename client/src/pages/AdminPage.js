import React, { useState, useEffect } from 'react';
import { applyApi, teacherApi, studentApi, topicApi } from '../api';
import { Table, Card, Button, Upload, message, Tabs, Select, Tag, Modal, InputNumber, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// import { Navigate } from 'react-router-dom';

const { TabPane } = Tabs;

const AdminPage = () => {
  const [activeKey, setActiveKey] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [applies, setApplies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [visible, setVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [teacherTopics, setTeacherTopics] = useState([]);
  const [teacherStudentsCount, setTeacherStudentsCount] = useState(0);

  const handleAssignTeacher = async (student) => {
    setSelectedStudent(student);
    setVisible(true);
  };

  const handleTeacherChange = async (teacherId) => {
    const teacher = teachers.find(t => t.teacher_no === teacherId);
    setSelectedTeacher(teacher);
    
    // 获取该教师的题目
    const topicsRes = await topicApi.getTopicsByTeacher(teacherId);
    setTeacherTopics(topicsRes);
    
    // 获取该教师已有学生数
    const countRes = await studentApi.getStudentsByTeacher(teacherId);
    setTeacherStudentsCount(countRes.length);
  };

  const handleOk = async () => {
    try {
      if (!selectedTeacher || !selectedTopic) {
        message.warning('请选择教师和题目');
        return;
      }
      
      await studentApi.assignTeacher({
        student_no: selectedStudent.student_no,
        teacher_no: selectedTeacher.teacher_no,
        topic_id: selectedTopic.id
      });
      
      message.success(`已为${selectedStudent.name}分配指导教师${selectedTeacher.name}`);
      setVisible(false);
      loadTabData('students');
    } catch (error) {
      message.error('分配指导教师失败');
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin' || (Array.isArray(user?.role) && user?.role.includes('admin'));
  
  useEffect(() => {
    isAdmin && loadTabData(activeKey);
  }, [activeKey, isAdmin]);


  if (!isAdmin) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>权限不足</h2>
        <p>你不是管理员，没有权限访问该页面</p>
      </div>
    );
  }


  const loadTabData = async (key) => {
    setLoading(true);
    try {
      switch (key) {
        case 'teachers':
          const teachersRes = await teacherApi.getTeachers();
          // console.log('teachersRes', teachersRes);
          setTeachers(teachersRes);
          break;
        case 'students':
          const studentsRes = await studentApi.getStudents();
          // console.log('studentsRes', studentsRes[0]);
          setStudents(studentsRes);
          break;
        case 'topics':
          const topicsRes = await topicApi.getTopics();
          setTopics(topicsRes);
          break;
        case 'applies':
          const appliesRes = await applyApi.getApplies();
          setApplies(appliesRes);
          break;
      }
    } catch (error) {
      console.error(`获取${key}数据失败:`, error);
      message.error(`获取${key}数据失败`);
    } finally {
      setLoading(false);
    }
  };


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
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '工号', dataIndex: 'teacher_no', key: 'teacher_no' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    { title: '教研室', dataIndex: 'department', key: 'department' },
    { 
      title: '最多指导学生数', 
      dataIndex: 'max_students', 
      key: 'max_students',
      render: (text, record) => (
        <InputNumber 
          min={1} 
          max={20}
          defaultValue={text || 10}
          onPressEnter={async (e) => {
            const value = e.target.value;
            try {
              await teacherApi.updateMaxStudents(record.teacher_no, value);
              message.success('更新成功');
              loadTabData('teachers'); // 刷新教师列表
            } catch (error) {
              message.error('更新失败');
              console.error('更新max_students失败:', error);
            }
          }}
        />
      )
    },
  ];

  const studentColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    // { title: '学号', dataIndex: 'student_no', key: 'student_no' },
    { title: '班级', dataIndex: 'class', key: 'class' },
    { title: '题目', dataIndex: 'topic_title', key: 'topic_title' },
    {
      title: '导师姓名', 
      dataIndex: 'teacher_name', 
      key: 'teacher_name',
      // render: (_, record) => {
      //   const validApply = record.applies?.find(a => a.status !== 'reject');
      //   return validApply?.teacher_name || '-';
      // }
    },
    { 
      title: '选题状态', 
      dataIndex: 'apply_status', 
      key: 'apply_status',
      render: (status) => {
        const statusMap = {
          'pending': { text: '教师审批中', color: 'orange' },
          'none': { text: '未申请', color: 'red' },
          'completed': { text: '已完成', color: 'green' }
        };
        const statusInfo = statusMap[status] || { text: '-', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    // {
    //   title: '操作',
    //   key: 'action',
    //   width: 150,
    //   render: (_, record) => (
    //     <Button 
    //       type="primary"
    //       onClick={() => handleAssignTeacher(record)}
    //     >
    //       分配指导教师
    //     </Button>
    //   ),
    // }
  ];

  const topicColumns = [
    { 
      title: '指导教师',
      dataIndex: 'teacher_name', 
      key: 'teacher_name',
      render: (_, record) => (
        <span>{record.teacher?.name || '-'}</span>
      ),
      width: 150  // 设置固定宽度
    },
    { 
      title: '题目名称', 
      dataIndex: 'title', 
      key: 'title',
      width: 400
    },
    { 
      title: '简介', 
      dataIndex: 'summary', 
      key: 'summary',
      // ellipsis: true  // 超出宽度显示省略号
    },
  ];

  const applyColumns = [
    { title: '学生姓名', dataIndex: 'student_name', key: 'student_name' },
    { title: '教师姓名', dataIndex: 'teacher_name', key: 'teacher_name' },
    { title: '题目名称', dataIndex: 'topic_title', key: 'topic_title' },
    { 
      title: '申请状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          'PENDING': { text: '审批中', color: 'orange' },
          'APPROVED': { text: '已通过', color: 'green' },
          'REJECTED': { text: '已拒绝', color: 'red' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Modal
        title="分配指导教师"
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>选择教师:</span>
          <Select
            style={{ width: 200 }}
            onChange={handleTeacherChange}
            placeholder="请选择教师"
          >
            {teachers.map(teacher => (
              <Select.Option key={teacher.teacher_no} value={teacher.teacher_no}>
                {teacher.name} ({teacher.teacher_no})
              </Select.Option>
            ))}
          </Select>
        </div>
        
        {selectedTeacher && (
          <div style={{ marginBottom: 16 }}>
            <p>教师: {selectedTeacher.name} (已有{teacherStudentsCount}名学生)</p>
            <span style={{ marginRight: 8 }}>选择题目:</span>
            <Select
              style={{ width: 400 }}
              onChange={value => setSelectedTopic(teacherTopics.find(t => t.id === value))}
              placeholder="请选择题目"
            >
              {teacherTopics.map(topic => (
                <Select.Option key={topic.id} value={topic.id}>
                  {topic.title}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
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
              <div>
                <Select
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="筛选选题状态"
                  allowClear
                  onChange={(value) => {
                    if (!value) {
                      loadTabData('students');
                    } else {
                      const filtered = students.filter(s => s.apply_status === value);
                      setStudents(filtered);
                    }
                  }}
                >
                  <Select.Option value="pending">教师审批中</Select.Option>
                  <Select.Option value="none">未申请</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                </Select>
                <Input
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="搜索学生姓名"
                  allowClear
                  onPressEnter={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      loadTabData('students');
                    } else {
                      const filtered = students.filter(s => s.name?.includes(value));
                      setStudents(filtered);
                    }
                  }}
                />
                <Input
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="筛选教师姓名"
                  allowClear
                  onPressEnter={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      loadTabData('students');
                    } else {
                      const filtered = students.filter(s => s.teacher_name?.includes(value));
                      console.log('filtered', students[0]);
                      setStudents(filtered);
                    }
                  }}
                />
                <Upload 
                  beforeUpload={(file) => handleImport('student', file)}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>导入学生</Button>
                </Upload>
                <Button 
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    import('xlsx').then(XLSX => {
                      const ws = XLSX.utils.json_to_sheet(students);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, '学生列表');
                      XLSX.writeFile(wb, '学生列表.xlsx');
                    });
                  }}
                >
                  导出Excel
                </Button>
              </div>
            }
          >
            <Table 
              columns={studentColumns} 
              dataSource={students} 
              loading={loading}
              rowKey="student_no"
              pagination={{
                showTotal: total => `共 ${total} 条`,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
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
          <Card 
            extra={
              <div>
                <Input
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="筛选教师姓名"
                  allowClear
                  onPressEnter={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      loadTabData('applies');
                    } else {
                      const filtered = applies.filter(a => a.teacher_name?.includes(value));
                      setApplies(filtered);
                    }
                  }}
                />
                <Select
                  style={{ width: 150, marginRight: 10 }}
                  placeholder="筛选申请状态"
                  allowClear
                  onChange={(value) => {
                    if (!value) {
                      loadTabData('applies');
                    } else {
                      loadTabData('applies').then(() => {
                        const filtered = applies.filter(a => a.status === value);
                        setApplies(filtered);
                      });
                    }
                  }}
                >
                  <Select.Option value="PENDING">审批中</Select.Option>
                  <Select.Option value="APPROVED">已通过</Select.Option>
                  <Select.Option value="REJECTED">已拒绝</Select.Option>
                </Select>
                <Button 
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    import('xlsx').then(XLSX => {
                      const ws = XLSX.utils.json_to_sheet(applies);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, '申请列表');
                      XLSX.writeFile(wb, '申请列表.xlsx');
                    });
                  }}
                >
                  导出Excel
                </Button>
              </div>
            }
          >
            <Table 
              columns={applyColumns} 
              dataSource={applies} 
              loading={loading}
              rowKey="id"
              pagination={{
                showTotal: total => `共 ${total} 条`,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100']
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminPage;