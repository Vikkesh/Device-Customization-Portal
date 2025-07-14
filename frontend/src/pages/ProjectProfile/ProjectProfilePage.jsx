import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FilePreview from '../../components/Preview/FilePreview';
import styles from './ProjectProfilePage.module.css';

const ProjectProfilePage = () => {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [inputFiles, setInputFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    timeZone: { enabled: false, value: 'IST' },
    timeFormat: { enabled: false, value: '24-hour' },
    screenTimeout: { enabled: false, value: '30-minutes' },
    language: { enabled: false, value: 'English' },
    fontSize: { enabled: false, value: 'Medium' },
    userDebugMode: { enabled: false, value: 'Disabled' }
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    bootLoader: { enabled: false, value: 'Standard' },
    kernelMode: { enabled: false, value: 'Normal' },
    memoryManagement: { enabled: false, value: 'Auto' }
  });

  // System settings options
  const systemSettingsOptions = {
    timeZone: ['IST', 'EST', 'UTC'],
    timeFormat: ['24-hour', '12-hour', 'Auto'],
    screenTimeout: ['15-minutes', '30-minutes', '1-hour'],
    language: ['English', 'Spanish', 'French'],
    fontSize: ['Small', 'Medium', 'Large'],
    userDebugMode: ['Disabled', 'Enabled', 'Developer']
  };

  const advancedSettingsOptions = {
    bootLoader: ['Standard', 'Fast', 'Secure'],
    kernelMode: ['Normal', 'Debug', 'Performance'],
    memoryManagement: ['Auto', 'Conservative', 'Aggressive']
  };

   if (!localStorage.getItem('token')) {
     navigate('/login');
  }

  // Group files by field
  const groupFilesByField = (files) => {
    return files.reduce((acc, file) => {
      const field = file.field || 'undefined';
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(file);
      return acc;
    }, {});
  };

  // Delete single file
  const deleteSingleFile = async (fileData, tableType) => {
    try {
      const endpoint = tableType === 'preview' 
        ? 'http://localhost:8080/api/preview/file'
        : 'http://localhost:8080/api/inputs/entry';
      
      const requestData = tableType === 'preview' 
        ? {
            s3_key: fileData.s3_key,
            project_id: project_id,
            field: fileData.field
          }
        : {
            project_id: project_id,
            field: fileData.field,
            value: fileData.value
          };
      
      const response = await axios.delete(endpoint, {
        data: requestData
      });

      if (response.data.success) {
        alert('File deleted successfully!');
        // Refresh the file lists
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  // Clear all files from a field
  const clearFieldFiles = async (field, tableType) => {
    if (!window.confirm(`Are you sure you want to delete all files in the "${field}" field?`)) {
      return;
    }

    try {
      const endpoint = tableType === 'preview' 
        ? `http://localhost:8080/api/preview/project/${project_id}/field/${field}`
        : `http://localhost:8080/api/inputs/project/${project_id}/field/${field}`;
      
      const response = await axios.delete(endpoint);

      if (response.data.success) {
        alert(`All files in "${field}" field deleted successfully!`);
        // Refresh the file lists
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing field files:', error);
      alert('Failed to clear field files');
    }
  };

  // Delete all project data
  const deleteAllProjectData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL data for this project? This action cannot be undone!')) {
      return;
    }

    try {
      const previewResponse = await axios.delete(`http://localhost:8080/api/preview/project/${project_id}`);
      const inputResponse = await axios.delete(`http://localhost:8080/api/inputs/project/${project_id}`);

      if (previewResponse.data.success && inputResponse.data.success) {
        alert('All project data deleted successfully!');
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (error) {
      console.error('Error deleting all project data:', error);
      alert('Failed to delete all project data');
    }
  };

  // Render input section for text inputs
  const renderInputSection = (title, inputs) => {
    const groupedInputs = groupFilesByField(inputs);
    
    if (Object.keys(groupedInputs).length === 0) {
      return (
        <div className={styles.fileSection}>
          <h3>{title}</h3>
          <p className={styles.noFiles}>No inputs added yet.</p>
        </div>
      );
    }

    return (
      <div className={styles.fileSection}>
        <h3>{title}</h3>
        {Object.entries(groupedInputs).map(([field, fieldInputs]) => (
          <div key={field} className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <h4 className={styles.fieldTitle}>{field}</h4>
              <button 
                className={styles.clearFieldButton}
                onClick={() => clearFieldFiles(field, 'input')}
              >
                Clear Field
              </button>
            </div>
            <div className={styles.inputGrid}>
              {fieldInputs.map((input) => (
                <div key={input.id} className={styles.inputItem}>
                  <div className={styles.inputValue}>
                    <strong>Value:</strong> {input.value}
                  </div>
                  <button 
                    className={styles.removeButton}
                    onClick={() => deleteSingleFile(input, 'input')}
                    title="Remove input"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render file section
  const renderFileSection = (title, files, tableType) => {
    const groupedFiles = groupFilesByField(files);
    
    if (Object.keys(groupedFiles).length === 0) {
      return (
        <div className={styles.fileSection}>
          <h3>{title}</h3>
          <p className={styles.noFiles}>No files uploaded yet.</p>
        </div>
      );
    }

    return (
      <div className={styles.fileSection}>
        <h3>{title}</h3>
        {Object.entries(groupedFiles).map(([field, fieldFiles]) => (
          <div key={field} className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <h4 className={styles.fieldTitle}>{field}</h4>
              <button 
                className={styles.clearFieldButton}
                onClick={() => clearFieldFiles(field, tableType)}
              >
                Clear Field
              </button>
            </div>
            <div className={styles.fileGrid}>
              {fieldFiles.map((file) => (
                <div key={file.id} className={styles.fileItem}>
                  <FilePreview 
                    url={file.url} 
                    type={file.filetype} 
                    fileName={file.filename}
                  />
                  <button 
                    className={styles.removeButton}
                    onClick={() => deleteSingleFile(file, tableType)}
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Handle system settings checkbox change
  const handleSystemSettingToggle = (setting, isAdvanced = false) => {
    if (isAdvanced) {
      setAdvancedSettings(prev => ({
        ...prev,
        [setting]: {
          ...prev[setting],
          enabled: !prev[setting].enabled
        }
      }));
    } else {
      setSystemSettings(prev => ({
        ...prev,
        [setting]: {
          ...prev[setting],
          enabled: !prev[setting].enabled
        }
      }));
    }
  };

  // Handle system settings value change
  const handleSystemSettingValueChange = (setting, value, isAdvanced = false) => {
    if (isAdvanced) {
      setAdvancedSettings(prev => ({
        ...prev,
        [setting]: {
          ...prev[setting],
          value: value
        }
      }));
    } else {
      setSystemSettings(prev => ({
        ...prev,
        [setting]: {
          ...prev[setting],
          value: value
        }
      }));
    }
  };

  // Submit system settings
  const submitSystemSettings = async (isAdvanced = false) => {
    const settings = isAdvanced ? advancedSettings : systemSettings;
    const settingsType = isAdvanced ? 'Advanced System Settings' : 'System Settings';
    
    // Prepare inputs array for enabled settings only
    const inputs = Object.entries(settings)
      .filter(([, settingData]) => settingData.enabled)
      .map(([field, settingData]) => ({
        field: field,
        value: settingData.value
      }));

    if (inputs.length === 0) {
      alert(`No ${settingsType.toLowerCase()} selected to submit.`);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/inputs/add-multiple-settings', {
        project_id: project_id,
        inputs: inputs
      });

      if (response.data.success) {
        alert(`${settingsType} submitted successfully!`);
        
        // Reset the submitted settings to unchecked state
        if (isAdvanced) {
          setAdvancedSettings(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              if (updated[key].enabled) {
                updated[key].enabled = false;
              }
            });
            return updated;
          });
        } else {
          setSystemSettings(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              if (updated[key].enabled) {
                updated[key].enabled = false;
              }
            });
            return updated;
          });
        }
        
        // Refresh the input files data
        await fetchInputFiles();
      }
    } catch (error) {
      console.error(`Error submitting ${settingsType.toLowerCase()}:`, error);
      alert(`Failed to submit ${settingsType.toLowerCase()}`);
    }
  };

  // Render system settings section
  const renderSystemSettingsSection = (title, settings, options, isAdvanced = false) => {
    return (
      <div className={styles.fileSection}>
        <h3>{title}</h3>
        <div className={styles.settingsGrid}>
          {Object.entries(settings).map(([settingKey, settingData]) => (
            <div key={settingKey} className={styles.settingItem}>
              <div className={styles.settingHeader}>
                <input
                  type="checkbox"
                  id={`${settingKey}-${isAdvanced ? 'advanced' : 'basic'}`}
                  checked={settingData.enabled}
                  onChange={() => handleSystemSettingToggle(settingKey, isAdvanced)}
                  className={styles.settingCheckbox}
                />
                <label 
                  htmlFor={`${settingKey}-${isAdvanced ? 'advanced' : 'basic'}`}
                  className={styles.settingLabel}
                >
                  {settingKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
              <select
                value={settingData.value}
                onChange={(e) => handleSystemSettingValueChange(settingKey, e.target.value, isAdvanced)}
                disabled={!settingData.enabled}
                className={`${styles.settingSelect} ${!settingData.enabled ? styles.disabled : ''}`}
              >
                {options[settingKey]?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button 
          className={styles.submitSettingsButton}
          onClick={() => submitSystemSettings(isAdvanced)}
        >
          Submit {title}
        </button>
      </div>
    );
  };

  // Fetch input files function
  const fetchInputFiles = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/inputs/project/${project_id}`);
      if (response.data.success) {
        setInputFiles(response.data.inputs || []);
      }
    } catch (error) {
      console.error('Failed to fetch input files:', error);
      setInputFiles([]);
    }
  }, [project_id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch project basic info
      try {
        const response = await axios.get(`http://localhost:8080/api/projects/${project_id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        setError('Failed to load project information');
      }

      // Fetch preview files
      try {
        const response = await axios.get(`http://localhost:8080/api/preview/project/${project_id}`);
        if (response.data.success) {
          setPreviewFiles(response.data.files || []);
        }
      } catch (error) {
        console.error('Failed to fetch preview files:', error);
        setPreviewFiles([]);
      }

      // Fetch input files
      await fetchInputFiles();

      setLoading(false);
    };

    if (project_id) {
      fetchData();
    }
  }, [project_id, fetchInputFiles]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>Loading project data... .</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.projectProfilePage}>
      <div className={styles.outerContainer}>
        <div className={styles.header}>
          <h1>Project Profile</h1>
          <button 
            className={styles.backButton}
            onClick={() => navigate(`/project/${project_id}`)}
          >
            Back to customization
          </button>
        </div>

        {/* Project Basic Info */}
        {project && (
          <div className={styles.projectInfo}>
            <h2>Project Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>Project ID:</strong> {project.project_id}
              </div>
              <div className={styles.infoItem}>
                <strong>Customer Name:</strong> {project.customer_name}
              </div>
              <div className={styles.infoItem}>
                <strong>Device Model:</strong> {project.device_model}
              </div>
              <div className={styles.infoItem}>
                <strong>Device Amount:</strong> {project.device_amount}
              </div>
              <div className={styles.infoItem}>
                <strong>Description:</strong> {project.project_description}
              </div>
            </div>
          </div>
        )}

        {/* Preview Files Section */}
        {renderFileSection('Preview Files', previewFiles, 'preview')}

        {/* Input Data Section */}
        {renderInputSection('Input Data', inputFiles)}

        {/* System Settings Section */}
        {renderSystemSettingsSection('System Settings', systemSettings, systemSettingsOptions)}

        {/* Advanced System Settings Section */}
        {renderSystemSettingsSection('Advanced System Settings', advancedSettings, advancedSettingsOptions, true)}

        {/* Delete All Data Button */}
        <div className={styles.dangerZone}>
          <h3>Danger Zone</h3>
          <p>Delete all data associated with this project. This action cannot be undone.</p>
          <button 
            className={styles.deleteAllButton}
            onClick={deleteAllProjectData}
          >
            Delete All Project Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectProfilePage;
