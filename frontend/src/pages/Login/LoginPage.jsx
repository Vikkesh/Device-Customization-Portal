import React, { useState } from 'react';
import axios from 'axios';
import styles from './LoginPage.module.css';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        loginIdentifier,
        password,
      });
      // Store token and user info (e.g., in localStorage or context)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Login successful:', response.data);
      navigate('/'); // Redirect to a protected route or dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.loginPage}>
      <h1>Device Customization Portal</h1>
      <div className={styles.loginFormContainer}>
        <h2>Login</h2>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="loginIdentifier">Username or Email</label>
            <input
              type="text"
              id="loginIdentifier"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.loginButton}>Login</button>
        </form>
        <p className={styles.registerPrompt}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
