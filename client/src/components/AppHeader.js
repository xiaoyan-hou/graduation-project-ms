import React, { useState } from 'react';
import { Layout, Dropdown, Menu, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// import { userApi } from '../api';

const { Header } = Layout;

const AppHeader = ({ user, onRoleChange }) => {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(user?.role || 'student');

  const handleMenuClick = async ({ key }) => {
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'logout') {
      // 处理退出登录逻辑
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleRoleChange = async (role) => {
    try {
      // await userApi.updateRole(role);
      setCurrentRole(role);
      message.success(`角色已切换为${getRoleName(role)}`);

      // 触发父组件的角色变更处理
      if (onRoleChange) {
        onRoleChange(role);
      }

      // 根据角色跳转到对应页面
      switch (role) {
        case 'student':
          navigate('/student');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      message.error('角色切换失败');
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'student': return '学生';
      case 'teacher': return '教师';
      case 'admin': return '管理员';
      default: return '用户';
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick} selectedKeys={[currentRole]}>
      <Menu.ItemGroup title="角色切换">
        <Menu.Item key="student" onClick={() => handleRoleChange('student')}>
          学生
        </Menu.Item>
        <Menu.Item key="teacher" onClick={() => handleRoleChange('teacher')}>
          教师
        </Menu.Item>
        <Menu.Item key="admin" onClick={() => handleRoleChange('admin')}>
          管理员
        </Menu.Item>
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key="profile">个人中心</Menu.Item>
      <Menu.Item key="logout">退出登录</Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
      <div style={{ paddingLeft: '24px', fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
        毕业设计管理系统
      </div>
      <Dropdown overlay={menu} trigger={['hover']}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Avatar
            icon={<UserOutlined />}
            style={{ marginRight: 8, backgroundColor: '#1890ff' }}
          />
          <span style={{ color: 'white' }}>{user?.name || '用户'}</span>
        </div>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;