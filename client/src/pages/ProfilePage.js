import React, { useState } from 'react';
import { Card, Select, Button, message } from 'antd';
import { userApi } from '../api';

const ProfilePage = () => {
  const [role, setRole] = useState('student');
  
  const handleRoleChange = async () => {
    try {
      await userApi.updateRole(role);
      message.success('角色更新成功');
    } catch (error) {
      message.error('角色更新失败');
    }
  };

  return (
    <Card title="个人中心">
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>当前角色:</span>
        <Select 
          value={role} 
          onChange={setRole}
          style={{ width: 120 }}
        >
          <Select.Option value="student">学生</Select.Option>
          <Select.Option value="teacher">教师</Select.Option>
          <Select.Option value="admin">管理员</Select.Option>
        </Select>
      </div>
      <Button type="primary" onClick={handleRoleChange}>确认修改</Button>
    </Card>
  );
};

export default ProfilePage;