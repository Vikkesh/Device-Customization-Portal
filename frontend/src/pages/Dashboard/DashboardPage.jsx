import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handlePersonalInfoClick = () => {
    navigate('/personalinfo');
  };

  const handleUserManagementClick = () => {
    navigate('/usermanagement');
  };

  return (
    <div className={styles.dashboardPage}>
      <h1>Dashboard</h1>
      <div className={styles.dashboardContainer}>
        <button onClick={handlePersonalInfoClick} className={styles.personalInfoButton}>
          Personal Information
        </button>
        <button onClick={handleUserManagementClick} className={styles.userManagementButton}>
          User Management
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
