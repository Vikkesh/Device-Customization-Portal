import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AddDevicePage.module.css';

const AddDevicePage = () => {
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);
  const [form, setForm] = useState({
    device_name: '',
    device_type: '',
    device_description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user?.role !== 'admin') {
      alert('Access denied. Only admin users can add devices.');
      setRedirect(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleBack = () => {
    navigate('/device-management');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!form.device_name.trim() || !form.device_type.trim()) {
      alert('Device name and type are required.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:8080/api/devices', form);
      alert('Device added successfully!');
      navigate('/device-management');
    } catch (error) {
      console.error('Failed to add device:', error);
      if (error.response?.status === 409) {
        alert('A device with this name already exists.');
      } else {
        alert(error.response?.data?.error || 'Failed to add device');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!localStorage.getItem('token') || redirect) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  return (
    <div className={styles.addDevicePage}>
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <h1>Add New Device</h1>
          <button onClick={handleBack} className={styles.backButton}>
            Back to Device Management
          </button>
        </div>

        <div className={styles.addDeviceSection}>
          <form onSubmit={handleSave} className={styles.deviceForm}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="device_name">
                Device Name *
              </label>
              <input
                type="text"
                id="device_name"
                name="device_name"
                value={form.device_name}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Enter device name"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="device_type">
                Device Type *
              </label>
              <input
                type="text"
                id="device_type"
                name="device_type"
                value={form.device_type}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Enter device type"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="device_description">
                Description
              </label>
              <textarea
                id="device_description"
                name="device_description"
                value={form.device_description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                placeholder="Enter device description (optional)"
                rows="4"
              />
            </div>

            <div className={styles.actionButtons}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Device'}
              </button>
              <button 
                type="button" 
                onClick={handleBack} 
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDevicePage;
