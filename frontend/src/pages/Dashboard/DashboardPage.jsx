import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handlePersonalInfoClick = () => {
    navigate('/personal-info');
  };

  return (
    <div className={styles.dashboardPage}>
        <nav className={styles.appNav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        </nav>
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
