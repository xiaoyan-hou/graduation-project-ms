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
  const user = JSON.parse(localStorage.getItem('user'));
  const { username, role } = user || {};
  const resolvedRole = Array.isArray(role) ? role[0] : role;
  const [currentRole, setCurrentRole] = useState(resolvedRole || '');
  const navigate = useNavigate();


  return (
    <Layout>
   
      <AppHeader 
        user={{ role: currentRole, name: username }}
        // onRoleChange={handleRoleChange}
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