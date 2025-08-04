import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CreateProjectProfilePage.module.css';

const CreateProjectProfilePage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [devices, setDevices] = useState([]);
  const [editedValues, setEditedValues] = useState({
    customer_name: '',
    device_amount: '',
    project_description: '',
    device_model: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  if (!localStorage.getItem('token')) {
     navigate('/login');
  }

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/projects/${id}`);
        setProject(response.data);
        // Initialize edited values with current project info
        setEditedValues({
          customer_name: response.data.customer_name,
          device_amount: response.data.device_amount,
          project_description: response.data.project_description,
          device_model: response.data.device_model
        });
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
    };

    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/devices');
        setDevices(response.data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      }
    };

    fetchProject();
    fetchDevices();
  }, [id]);

  // Track changes
  useEffect(() => {
    if (project) {
      const hasChangesNow = 
        editedValues.customer_name !== project.customer_name ||
        editedValues.device_amount !== project.device_amount ||
        editedValues.project_description !== project.project_description ||
        editedValues.device_model !== project.device_model;
      setHasChanges(hasChangesNow);
    }
  }, [editedValues, project]);

  const handleInputChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/api/projects/${id}`, editedValues);
      if (response.data.success) {
        // Update the project state with new values
        setProject(prev => ({
          ...prev,
          ...editedValues
        }));
        setHasChanges(false);
        alert('Project updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  if (!project) {
    return <div>Project doesn't exist or You don't have access to that project.</div>;
  }

  return (
    <div className={styles.createProjectProfilePage}>
      <div className={styles.mainContentRow}>
        <div className={styles.outerContainer}>
          <h2>Project Profile</h2>
          <div className={styles.profileContainer}>
            <h3>Project Basic Info</h3>
            <div className={styles.infoGrid}>
              <div className={styles.inputGroup}>
                <label><strong>Customer Name:</strong></label>
                <input
                  type="text"
                  value={editedValues.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.inputGroup}>
                <label><strong>Shipping Device Amounts:</strong></label>
                <input
                  type="number"
                  value={editedValues.device_amount}
                  onChange={(e) => handleInputChange('device_amount', e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <p><strong>ID:</strong> {project.project_id}</p>
              <div className={styles.inputGroup}>
                <label><strong>Project Description:</strong></label>
                <textarea
                  value={editedValues.project_description}
                  onChange={(e) => handleInputChange('project_description', e.target.value)}
                  className={styles.textareaField}
                  rows="3"
                />
              </div>
              <div className={styles.inputGroup}>
                <label><strong>Device Model:</strong></label>
                <select
                  value={editedValues.device_model}
                  onChange={(e) => handleInputChange('device_model', e.target.value)}
                  className={styles.selectField}
                >
                  <option value="">Select a device model</option>
                  {devices.map(device => (
                    <option key={device.device_id} value={device.device_name}>
                      {device.device_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {hasChanges && (
              <button 
                onClick={handleSaveChanges}
                className={styles.saveButton}
              >
                Save Changes
              </button>
            )}
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
    </div>
  );
};

export default CreateProjectProfilePage;
