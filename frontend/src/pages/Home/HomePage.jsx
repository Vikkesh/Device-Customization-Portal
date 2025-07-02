import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import SearchComponent from '../../components/SearchComponent/SearchComponent';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCreateProject = () => {
    navigate('/createproject');
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={styles.homePage}>
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
      <p> Welcome, {user?.username || 'User'}! This is your project dashboard.</p>
      <div className={styles.projectManagementSection}>
        <div className={styles.controlsContainer}>
          <SearchComponent />
        </div>
        <div className={styles.createProjectContainer}>
          <button onClick={handleCreateProject} className={styles.createProjectButton}>
            Create Project
          </button>
        </div>
        <table className={styles.projectsTable}>
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Customer Name</th>
              <th>Shipping Country</th>
              <th># of active</th>
              <th># of total</th>
              <th>Device Model</th>
              <th>Device Amount</th>
              <th>Created by</th>
              <th>Status</th>
              <th>Description</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No projects to display yet.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.project_id}>
                  <td><Link to={`/project/${project.project_id}`}>{project.project_id}</Link></td>
                  <td>{project.customer_name}</td>
                  <td>{project.shipping_country}</td>
                  <td>{project.num_active_projects}</td>
                  <td>{project.num_total_projects}</td>
                  <td>{project.device_model}</td>
                  <td>{project.device_amount}</td>
                  <td>{project.created_by}</td>
                  <td>{project.project_status}</td>
                  <td>{project.project_description}</td>
                  <td><input type="checkbox" /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomePage;
