import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
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
// api.interceptors.response.use(response => {
//   return response.data;
// }, error => {
//   if (error.response?.status === 401) {
//     // token过期或无效，跳转到登录页
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     window.location.href = '/login';
//   }
//   return Promise.reject(error);
// });

// 认证相关API
export const login = async (data) => {
  console.log('api登录接口接收到的数据:', data);
  try {
    const res = await api.post('/auth/login', data);
    console.log('api登录接口返回的数据:', res);
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
      console.log('api获取的教师列表:', response);
      return response.data;
    } catch (error) {
      console.error('获取教师列表失败:', error);
      return [];
    }
  }
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
        return response.data;
      } catch (error) {
        console.error('获取学生列表失败:', error);
        // 返回空数组
        return [];
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
  applyTopic: async (topicId, teacherId, studentId, studentName, teacherName, topicTitle) => {
    try {
      const response = await api.post('/apply', {
        student_id: studentId,
        teacher_id: teacherId,
        topic_id: topicId,
        student_name: studentName,
        teacher_name: teacherName,
        topic_title: topicTitle
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
  updateApply: (id, data) => api.put(`/apply/${id}`, data),
  getApplies: async () => {
    try {
      const response = await api.get('/applies');
      // 确保返回的是数组
      console.log('获取的申请列表:', response);
      return response.data;
    } catch (error) {
      console.error('获取申请列表失败:', error);
      // 返回空数组
      return [];
    }
  }
};