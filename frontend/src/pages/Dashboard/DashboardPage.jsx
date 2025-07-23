import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import { useEffect } from 'react';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handlePersonalInfoClick = () => {
    navigate('/personalinfo');
  };

  const handleUserManagementClick = () => {
    navigate('/usermanagement');
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className={styles.dashboardPage}>
      <h1>Dashboard</h1>
      <div className={styles.dashboardContainer}>
        <button onClick={handlePersonalInfoClick} className={styles.personalInfoButton}>
          Personal Information
        </button>
        {user?.role === 'admin' && (
          <button onClick={handleUserManagementClick} className={styles.userManagementButton}>
            User Management
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
