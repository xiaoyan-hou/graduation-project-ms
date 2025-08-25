import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/AppHeader';
import StudentPage from './pages/StudentPage';
import TeacherPage from './pages/TeacherPage';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';

const { Content } = Layout;

const AppLayout = () => {
  const [currentRole, setCurrentRole] = useState('student');
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    // 根据角色跳转到对应页面
    switch(role) {
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
  };

  return (
    <Layout>
   
      <AppHeader 
        user={{ role: currentRole, name: '王小明' }}
        onRoleChange={handleRoleChange}
      />
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;