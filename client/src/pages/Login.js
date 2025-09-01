import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, message } from 'antd';
import './Login.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        // console.log('Received values of form: ', values);
        try {
            setLoading(true);
            // console.log('befor login values', values);
            const res = await login(values);
            const { token, user, permissions } = res; // 解构respons
            // console.log('after login', token, user);
            // 存储token和用户信息
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            // localStorage.setItem('permissions', JSON.stringify(permissions));

            message.success('登录成功');
            // 登录成功后跳转到对应的角色首页，但是需要考虑一个用户多个角色
            // console.log('user.role', user.role);
            const role = Array.isArray(user.role) ? user.role[0] : user.role;
            if (role === 'admin') {
                navigate('/admin');
            }  else if (role === 'teacher') {
                navigate('/teacher');
            }   else if (role === 'student') {
                navigate('/student');
            } else {
                navigate('/');
            }
            // navigate('/');
        } catch (error) {
            message.error(error.response?.data?.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>毕业设计管理系统</h2>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    style={{ maxWidth: 360 }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="userno"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Flex justify="space-between" align="center">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <a href="">Forgot password</a>
                        </Flex>
                    </Form.Item>

                    <Form.Item>
                        <Button block type="primary" htmlType="submit">
                            Log in
                        </Button>
                        {/* or <a href="">Register now!</a> */}
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default Login;