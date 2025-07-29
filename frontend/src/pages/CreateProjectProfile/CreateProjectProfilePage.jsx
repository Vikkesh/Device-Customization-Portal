import React, { useState ,useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateProjectProfilePage.module.css';

const CreateProjectProfilePage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
   const navigate = useNavigate();
  if (!localStorage.getItem('token')) {
     navigate('/login');
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
    };

    fetchProject();
  }, [id]);

  if (!project) {
    return <div>Project doesn't exist or You don't have access to that project.</div>;
  }

  return (
    <div className={styles.createProjectProfilePage}>
      <div className={styles.outerContainer}>
        <h2>Project Profile</h2>
        <div className={styles.profileContainer}>
          <h3>Project Basic Info</h3>
          <div className={styles.infoGrid}>
            <p><strong>Customer Name:</strong> {project.customer_name}</p>
            <p><strong>Shipping Device Amounts:</strong> {project.device_amount}</p>
            <p><strong>ID:</strong> {project.project_id}</p>
            <p><strong>Project Description:</strong> {project.project_description}</p>
            <p><strong>Device Model:</strong> {project.device_model}</p>
          </div>
        </div>
      </div>
      
      <div className={styles.navigationContainer}>
        <h2>Customization Options</h2>
        <div className={styles.linkContainer}>
          <Link to={`/${project.project_id}/projectprofile`} className={styles.navLink}>
            <div className={styles.linkCard}>
              <h3>Project Profile</h3>
              <p>All the custom requirements from the below pages for the project, come here to remove and modify submissions</p>
            </div>
          </Link>
          <Link to={`/${project.project_id}/hometheme`} className={styles.navLink}>
            <div className={styles.linkCard}>
              <h3>Home Theme</h3>
              <p>Customize wallpapers, launchers, icons, and ringtones</p>
            </div>
          </Link>
          <Link to={`/${project.project_id}/bootshutdown`} className={styles.navLink}>
            <div className={styles.linkCard}>
              <h3>Boot & Shutdown</h3>
              <p>Configure boot animations and shutdown settings</p>
            </div>
          </Link>
          <Link to={`/${project.project_id}/apps`} className={styles.navLink}>
            <div className={styles.linkCard}>
              <h3>Preload Apps</h3>
              <p>Configure apps to be preloaded on the device</p>
            </div>
          </Link>
    
        </div>
      </div>
    </div>
  );
};

export default CreateProjectProfilePage;
