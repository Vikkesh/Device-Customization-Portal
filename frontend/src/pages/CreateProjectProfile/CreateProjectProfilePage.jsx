import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateProjectProfilePage.module.css';

const CreateProjectProfilePage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

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
    return <div>Loading...</div>;
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
    </div>
  );
};

export default CreateProjectProfilePage;
