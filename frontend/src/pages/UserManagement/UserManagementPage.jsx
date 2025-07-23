import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './UserManagementPage.module.css';
import SearchComponent from '../../components/SearchComponent/SearchComponent';
import axios from 'axios';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'admin') {
      alert('Access denied. Only admin users can view this page.');
      setRedirect(true);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  if (!localStorage.getItem('token') || redirect) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  return (
    <div className={styles.userManagementPage}>
      <div className={styles.pageContent}>
        <h1>User Management</h1>

        <div className={styles.userManagementSection}>
          <div className={styles.controlsContainer}>
            <SearchComponent />
          </div>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users to display yet.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td><input type="checkbox" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
