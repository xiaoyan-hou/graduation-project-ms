import axios from 'axios';

const api = axios.create({
  // baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  baseURL: 'http://47.107.176.158:5000/api',
  timeout: 5000
});

// 请求拦截器 - 添加token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 响应拦截器 - 处理错误
api.interceptors.response.use(response => {
  return response.data;
}, error => {
  if (error.response?.status === 401) {
    // token过期或无效，跳转到登录页
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

// 认证相关API
export const login = async (data) => {
  try {
    const res = await api.post('/auth/login', data);
    return res;
  } catch (error) {
    console.error('登录接口错误:', error);
    throw error;
  }
}

export const authApi = {
  login,
  getProfile: () => api.get('/auth/profile')
};

// 用户相关API
export const userApi = {
  // 获取用户信息
  getUserInfo: (userId) => api.get(`/users/${userId}`),

  // 更新用户信息
  updateUserInfo: (userId, data) => api.post(`/users/${userId}`, data),

  // 修改密码
  changePassword: (userId, data) => api.post(`/users/${userId}/password`, data),

  // 更新用户角色
  updateRole: (userId, role) => api.post(`/users/${userId}/role`, { role })
};

// 教师相关API
export const teacherApi = {
  importTeachers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/teachers/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getTeachers: async () => {
    try {
      const response = await api.get('/teachers');
      // console.log('api获取的教师列表:', response);
      return response.data;
    } catch (error) {
      console.error('获取教师列表失败:', error);
      return [];
    }
  },
  updateMaxStudents: (teacherNo, maxStudents) => api.post(`/teachers/${teacherNo}/max-students`, { max_students: maxStudents })
};

// 学生相关API
export const studentApi = {
  importStudents: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getStudents: async () => {
    try {
      const response = await api.get('/students');
      // console.log('获取的学生列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取学生列表失败:', error);
      // 返回空数组
      return [];
    }
  },
  getStudentByNo: async (studentNo) => {
    try {
      const response = await api.get(`/students/${studentNo}`);
      return response.data;
    } catch (error) {
      console.error('获取学生信息失败:', error);
      return null;
    }
  }
};

// 毕设题目相关API
export const topicApi = {
  importTopics: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/topics/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  // 获取指定教师的毕设题目
  getTopicsByTeacher: async (teacherNo) => {
    try {
      const response = await api.get(`/topics/teacher/${teacherNo}`);
      // console.log('获取的教师我的题目列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取教师题目列表失败:', error);
      return [];
    }
  },
  // 获取所有毕设题目
  getTopics: async () => {
    try {
      const response = await api.get('/topics');
      //   console.log('获取的题目列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取题目列表失败:', error);
      return [];
    }
  },
  // 申请毕设题目
  applyTopic: async (topicId,
    teacherNo,
    studentNo,
    studentName,
    teacherName,
    topicTitle,
    studentClass) => {
    try {
      const response = await api.post('/apply', {
        student_no: studentNo,
        teacher_no: teacherNo,
        topic_id: topicId,
        student_name: studentName,
        teacher_name: teacherName,
        topic_title: topicTitle,
        student_class: studentClass
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: '申请失败' };
    }
  },

  // 在StudentPage组件中的使用示例
  handleApply: async (topic) => {
    try {
      await topicApi.applyTopic(
        topic.id,
        topic.teacher_no,
        topic.student_no,
        topic.student_name,
        // currentUser.id,
        // currentUser.name,
        topic.teacher_name,
        topic.title
      );
      // 更新UI状态
    } catch (error) {
      alert(error.message);
    }
  }
};

// 申请相关API
export const applyApi = {
  createApply: (data) => api.post('/apply', data),
  updateApply: (id, data) => api.post(`/apply/${id}`, data),
  getApplies: async () => {
    try {
      const response = await api.get('/applies');
      // 确保返回的是数组
      // console.log('获取的申请列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取申请列表失败:', error);
      return [];
    }
  },
  getAppliesByStudent: async (studentNo) => {
    try {
      console.log('获取学生申请列表的学生学号:', studentNo);
      const response = await api.get(`/applies/student/${studentNo}`);
      // console.log('获取的我的申请列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取学生申请列表失败:', error);
      return [];
    }
  },
  getTeacherStats: async () => {
    try {
      const response = await api.get('/applies/teacher-stats');
      return response.data;
    } catch (error) {
      console.error('获取教师统计信息失败:', error);
      return {};
    }
  }
}

