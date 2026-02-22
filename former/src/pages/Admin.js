import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { userAPI } from '../services/api';

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const res = await userAPI.getAll();
      setUsers(res.data.data);
    } catch (error) {
      console.error('加载用户失败', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="access-denied">无权访问此页面</div>;
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="admin-page">
      <h2>用户管理</h2>
      
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="users-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>姓名</th>
                <th>角色</th>
                <th>注册时间</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.name}</td>
                  <td>{u.role === 'admin' ? '管理员' : '法医'}</td>
                  <td>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
