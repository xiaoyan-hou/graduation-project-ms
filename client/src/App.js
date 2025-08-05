import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AdminPage from './pages/AdminPage';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';

const { Header, Content } = Layout;

const App = () => {
  const [role, setRole] = useState('admin'); // 默认管理员

  const roleMenu = (
    <Menu onClick={({ key }) => setRole(key)}>
      <Menu.Item key="admin">管理员</Menu.Item>
      <Menu.Item key="teacher">教师</Menu.Item>
      <Menu.Item key="student">学生</Menu.Item>
    </Menu>
  );

  const renderPage = () => {
    switch (role) {
      case 'admin':
        return <AdminPage />;
      case 'teacher':
        return <TeacherPage />;
      case 'student':
        return <StudentPage />;
      default:
        return <AdminPage />;
    }
  };

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>毕业设计管理系统</div>
        <Dropdown overlay={roleMenu} placement="bottomRight">
          <Button type="primary" icon={<UserOutlined />}>
            {role === 'admin' ? '管理员' : role === 'teacher' ? '教师' : '学生'}
          </Button>
        </Dropdown>
      </Header>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        {renderPage()}
      </Content>
    </Layout>
  );
};

export default App;