import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './UserManagementPage.module.css';
import SearchComponent from '../../components/SearchComponent/SearchComponent';
import axios from 'axios';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

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

  const handleUserSelection = (userId, isChecked) => {
    if (isChecked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete('http://localhost:8080/api/users/bulk-delete', {
        data: { userIds: selectedUsers }
      });
      
      // Refresh the users list
      const response = await axios.get('http://localhost:8080/api/users');
      setUsers(response.data);
      setSelectedUsers([]);
      alert('Users deleted successfully!');
    } catch (error) {
      console.error('Failed to delete users:', error);
      alert('Failed to delete users. Please try again.');
    }
  };

  const handleToggleAdmin = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await axios.patch('http://localhost:8080/api/users/toggle-admin', {
        userIds: selectedUsers
      });
      
      // Refresh the users list
      const response = await axios.get('http://localhost:8080/api/users');
      setUsers(response.data);
      setSelectedUsers([]);
      alert('User roles updated successfully!');
    } catch (error) {
      console.error('Failed to update user roles:', error);
      alert('Failed to update user roles. Please try again.');
    }
  };

  return (
    <div className={styles.userManagementPage}>
      <div className={styles.pageContent}>
        <h1>User Management</h1>

        <div className={styles.userManagementSection}>
          <div className={styles.controlsContainer}>
            <SearchComponent 
              onSearchResults={setFilteredUsers}
              data={users}
              searchFields={['username', 'email', 'role']}
              placeholder="Search users by username, email, or role..."
            />
            <div className={styles.adminButtons}>
              <button 
                className={`${styles.adminButton} ${styles.deleteButton}`}
                onClick={handleDeleteUsers}
                disabled={selectedUsers.length === 0}
              >
                Delete User{selectedUsers.length > 1 ? 's' : ''}
              </button>
              <button 
                className={`${styles.adminButton} ${styles.toggleAdminButton}`}
                onClick={handleToggleAdmin}
                disabled={selectedUsers.length === 0}
              >
                Set/Remove Admin
              </button>
            </div>
          </div>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Select 
                  <input 
                    type="checkbox" 
                    className={styles.selectAllCheckbox}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {(filteredUsers.length > 0 ? filteredUsers : users).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users to display yet.</td>
                </tr>
              ) : (
                (filteredUsers.length > 0 ? filteredUsers : users).map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                      />
                    </td>
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
