import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PersonalInfoPage.module.css';

const PersonalInfoPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${user.id}/stats`);
        setUserInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.personalInfoPage}>
      <div className={styles.infoCard}>
        <h1 className={styles.title}>Personal Information</h1>
        <div className={styles.infoItem}>
          <span className={styles.label}>User Name:</span>
          <span className={styles.value}>{userInfo.username}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>User ID:</span>
          <span className={styles.value}>{userInfo.user_id}</span>
        </div>
         <div className={styles.infoItem}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{userInfo.email}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Projects Created:</span>
          <span className={styles.value}>{userInfo.projects_created}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Total Devices Shipping:</span>
          <span className={styles.value}>{userInfo.total_devices}</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoPage;
