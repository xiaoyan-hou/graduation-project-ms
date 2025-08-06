import axios from 'axios';
// import * as XLSX from 'xlsx';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 1000
});

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
      console.log('api获取的教师列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取教师列表失败:', error);
      return { data: []};
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
        return { data: []};
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
      return { data: []};
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
      console.log('获取的申请列表:', response.data);
      return response.data;
    } catch (error) {
      console.error('获取申请列表失败:', error);
      // 返回空数组
      return { data: []};
    }
  }
};