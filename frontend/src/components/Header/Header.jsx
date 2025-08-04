import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightTheme(true);
      document.body.classList.add('light-theme');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = !isLightTheme;
    setIsLightTheme(newTheme);
    
    if (newTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <nav className={styles.appNav}>
      <div className={styles.headerSection}>
    <Link to="/" className={styles.navLink}>Home</Link>
  </div>
     <div className={styles.headerCenter}>
    <span className={styles.navTitle}>Device Customization Portal</span>
  </div>
      <div className={`${styles.headerSection} ${styles.navControls}`}>
        <button 
          onClick={toggleTheme} 
          className={styles.themeToggle}
          aria-label="Toggle theme"
        >
          {isLightTheme ? '🌙' : '☀️'}
        </button>
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
      </div>
    </nav>
  );
};

export default Header;
