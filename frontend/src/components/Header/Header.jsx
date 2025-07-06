import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={styles.appNav}>
      <Link to="/" className={styles.navLink}>Home</Link>
      {localStorage.getItem('token') ? (
        <div className={styles.navLinkRight}>
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <button onClick={handleLogout} className={`${styles.logoutButton} ${styles.navLink}`}>
            Logout
          </button>
        </div>
      ) : (
        <>
          <Link to="/login" className={styles.navLink}>Login</Link>
          <Link to="/register" className={`${styles.navLink} ${styles.registerLink}`}>Register</Link>
        </>
      )}
    </nav>
  );
};

export default Header;
