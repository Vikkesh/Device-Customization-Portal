import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DeviceManagementPage.module.css';

const DeviceManagementPage = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setRedirect(true);
    }
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/devices');
        setDevices(response.data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!redirect) {
      fetchDevices();
    }
  }, [redirect]);

  const handleDeviceClick = (deviceId) => {
    navigate(`/device-information/${deviceId}`);
  };

  const handleAddDeviceClick = () => {
    navigate('/add-device');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!localStorage.getItem('token') || redirect) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className={styles.deviceManagementPage}>
      <div className={styles.pageContent}>
        <div className={styles.header}>
          <h1>{user?.role === 'admin' ? 'Device Management' : 'Devices'}</h1>
          <button onClick={handleBackToDashboard} className={styles.backButton}>
            Back to Dashboard
          </button>
        </div>

        <div className={styles.deviceManagementSection}>
          <div className={styles.controlsContainer}>
            {user?.role === 'admin' && (<>
              <button onClick={handleAddDeviceClick} className={styles.addDeviceButton}>
                Add Device
              </button>
            </>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>Loading devices...</div>
          ) : (
            <div className={styles.devicesGrid}>
              {devices.length === 0 ? (
                <div className={styles.noDevices}>No devices available yet.</div>
              ) : (
                devices.map((device) => (
                  <div
                    key={device.device_id}
                    className={styles.deviceCard}
                    onClick={() => handleDeviceClick(device.device_id)}
                  >
                    <h3 className={styles.deviceName}>{device.device_name}</h3>
                    <p className={styles.deviceType}>Type: {device.device_type}</p>
                    <p className={styles.deviceDescription}>
                      {device.device_description || 'No description available'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementPage;
