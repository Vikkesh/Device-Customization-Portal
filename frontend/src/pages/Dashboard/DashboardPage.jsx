import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handlePersonalInfoClick = () => {
    navigate('/personalinfo');
  };

  return (
    <div className={styles.dashboardPage}>
      <h1>Dashboard</h1>
      <div className={styles.dashboardContainer}>
        <button onClick={handlePersonalInfoClick} className={styles.personalInfoButton}>
          Personal Information
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
