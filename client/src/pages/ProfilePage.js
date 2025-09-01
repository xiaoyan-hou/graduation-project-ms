import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Tabs, Select } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { userApi } from '../api';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await userApi.getUserInfo(user.id);
      setUserInfo({
        ...res.data,
        phone: res.data.phone || '未设置',
        wechat: res.data.wechat || '未设置'
      });
      
      form.setFieldsValue({
        phone: user.phone || '',
        wechat: user.vx || ''
      });
      
      setRole(user?.role || 'student');
    } catch (error) {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (values) => {
    try {
      setLoading(true);
      await userApi.updateUserInfo(userInfo.id, values);
      
      // 更新本地用户信息
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, ...values }));
      setUserInfo(prev => ({ ...prev, ...values }));
      
      message.success('信息更新成功');
    } catch (error) {
      message.error('信息更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await userApi.changePassword(userInfo.id, values);
      message.success('密码修改成功');
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    try {
      setLoading(true);
      await userApi.updateRole(userInfo.id, role);
      
      // 更新本地用户信息
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, role }));
      setUserInfo(prev => ({ ...prev, role }));
      
      message.success('角色更新成功');
    } catch (error) {
      message.error('角色更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="个人信息" key="1">
          <Card title="基本信息" loading={loading}>
            {userInfo && (
              <div>
                <p><strong>姓名：</strong>{userInfo.username}</p>
                <p><strong>学号/工号：</strong>{userInfo.userno}</p>
                <p><strong>角色：</strong>{userInfo.role}</p>
                <p><strong>手机号：</strong>{userInfo.phone}</p>
                <p><strong>微信：</strong>{userInfo.vx}</p>
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="修改信息" key="2">
          <Card title="修改联系方式" loading={loading}>
            <Form
              form={form}
              onFinish={handleUpdateInfo}
              layout="vertical"
            >
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="手机号" />
              </Form.Item>
              
              <Form.Item
                name="vx"
                label="微信"
                rules={[{ required: true, message: '请输入微信号' }]}
              >
                <Input placeholder="微信号" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          <Card title="修改密码" style={{ marginTop: '16px' }} loading={loading}>
            <Form onFinish={handleChangePassword} layout="vertical">
              <Form.Item
                name="oldPassword"
                label="旧密码"
                rules={[{ required: true, message: '请输入旧密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="旧密码" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[{ required: true, message: '请输入新密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage;