import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DeviceInformationPage.module.css';

const DeviceInformationPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    device_name: '',
    device_type: '',
    device_description: ''
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setRedirect(true);
    }
  }, []);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/devices/${deviceId}`);
        setDevice(response.data);
        setEditForm({
          device_name: response.data.device_name,
          device_type: response.data.device_type,
          device_description: response.data.device_description || ''
        });
      } catch (error) {
        console.error('Failed to fetch device:', error);
          if (error.response?.status === 404) {
          alert('Device not found');
          navigate('/device-management');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!redirect && deviceId) {
      fetchDevice();
    }
  }, [redirect, deviceId, navigate]);

  const handleBack = () => {
    navigate('/device-management');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      device_name: device.device_name,
      device_type: device.device_type,
      device_description: device.device_description || ''
    });
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/api/devices/${deviceId}`, editForm);
      setDevice(response.data);
      setIsEditing(false);
      alert('Device updated successfully!');
    } catch (error) {
      console.error('Failed to update device:', error);
      alert(error.response?.data?.error || 'Failed to update device');
    }
  };

  if (!localStorage.getItem('token') || redirect) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className={styles.deviceInformationPage}>
        <div className={styles.loading}>Loading device information...</div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className={styles.deviceInformationPage}>
        <div className={styles.error}>Device not found</div>
      </div>
    );
  }

  return (
    <div className={styles.deviceInformationPage}>
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <h1>Device Information</h1>
          <button onClick={handleBack} className={styles.backButton}>
            Back to Device Management
          </button>
        </div>

        <div className={styles.deviceInfoSection}>
          <div className={styles.deviceInfo}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Device Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="device_name"
                  value={editForm.device_name}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <div className={styles.fieldValue}>{device.device_name}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Device Type:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="device_type"
                  value={editForm.device_type}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <div className={styles.fieldValue}>{device.device_type}</div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Description:</label>
              {isEditing ? (
                <textarea
                  name="device_description"
                  value={editForm.device_description}
                  onChange={handleInputChange}
                  className={styles.editTextarea}
                  rows="4"
                />
              ) : (
                <div className={styles.fieldValue}>
                  {device.device_description || 'No description available'}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className={styles.actionButtons}>
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className={styles.saveButton}>
                      Save Changes
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleEdit} className={styles.editButton}>
                    Edit Device
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInformationPage;
