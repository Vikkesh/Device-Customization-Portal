import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './PersonalInfoPage.module.css';

const PersonalInfoPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [editedValues, setEditedValues] = useState({
    username: '',
    email: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  
    useEffect(() => {
      if (!localStorage.getItem('token')) {
        navigate('/login');
      }
    }, [navigate]);

const user = JSON.parse(localStorage.getItem('user'));
const userId = user ? user.id : null;

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${userId}/stats`);
        setUserInfo(response.data);
        // Initialize edited values with current user info
        setEditedValues({
          username: response.data.username,
          email: response.data.email
        });
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    if (user) {
      fetchUserInfo();
    }
  }, [userId]);

  const handleInputChange = (field, value) => {
  setEditedValues(prev => ({
    ...prev,
    [field]: value
  }));
};

// Add this useEffect after your state declarations
useEffect(() => {
  if (userInfo) {
    const hasChangesNow =
      editedValues.username !== userInfo.username ||
      editedValues.email !== userInfo.email;
    setHasChanges(hasChangesNow);
  }
}, [editedValues, userInfo]);

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/api/users/${user.id}`, {
        username: editedValues.username,
        email: editedValues.email
      });

      if (response.data.success) {
        // Update local storage user info
        const updatedUser = { ...user, username: editedValues.username, email: editedValues.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update userInfo state
        setUserInfo(prev => ({
          ...prev,
          username: editedValues.username,
          email: editedValues.email
        }));
        
        setHasChanges(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.personalInfoPage}>
      <div className={styles.infoCard}>
        <h1 className={styles.title}>Personal Information</h1>
        <div className={styles.infoItem}>
          <span className={styles.label}>User Name:</span>
          <input 
            type="text" 
            value={editedValues.username} 
            onChange={(e) => handleInputChange('username', e.target.value)}
            className={styles.inputField}
          />
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>User ID:</span>
          <span className={styles.value}>{userInfo.user_id}</span>
        </div>
         <div className={styles.infoItem}>
          <span className={styles.label}>Email:</span>
          <input 
            type="email" 
            value={editedValues.email} 
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={styles.inputField}
          />
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Projects Created:</span>
          <span className={styles.value}>{userInfo.projects_created}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Total Devices Shipping:</span>
          <span className={styles.value}>{userInfo.total_devices}</span>
        </div>
        
        {hasChanges && (
          <div className={styles.saveButtonContainer}>
            <button onClick={handleSave} className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoPage;
