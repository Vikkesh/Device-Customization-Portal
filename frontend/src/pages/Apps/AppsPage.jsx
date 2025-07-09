import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './AppsPage.module.css';
import FilePreview from '../../components/Preview/FilePreview';

export default function AppsPage() {
  const { project_id } = useParams();
  const [textFiles, setTextFiles] = useState([]);
  const [appNames, setAppNames] = useState('');

  const handleFileChange = (e, setter) => {
    const selected = Array.from(e.target.files);
    setter(selected);
  };

  const renderPreview = (files, type, label) => {
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return null;
    }

    const fileArray = Array.isArray(files) ? files : [files];
    
    return (
      <div className={styles.previewGroup}>
        <h4>{label}</h4>
        <div className={styles.previewGrid}>
          {fileArray.map((file, index) => (
            <FilePreview 
              key={index}
              url={URL.createObjectURL(file)}
              type={type}
              fileName={file.name}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleAppNamesSubmit = async () => {
    if (!appNames.trim()) {
      alert('Please enter app names');
      return;
    }

    // Split by commas and trim whitespace
    const appNamesArray = appNames.split(',').map(name => name.trim()).filter(name => name);
    
    if (appNamesArray.length === 0) {
      alert('Please enter valid app names');
      return;
    }

    // Submit each app name individually
    for (const appName of appNamesArray) {
      try {
        await handleSubmit(appName, 'text-input', 'app-names');
      } catch (error) {
        console.error(`Failed to submit app name: ${appName}`, error);
      }
    }
    
    // Clear the input after successful submission
    setAppNames('');
  };

  const handleSubmit = async (data, type, field) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      alert(`Please provide input for ${field}`);
      return;
    }

    if (type === 'text') {
      const formData = new FormData();
      const files = Array.isArray(data) ? data : [data];
      
      files.forEach(file => formData.append('files', file));
      formData.append('project_id', project_id);
      formData.append('type', type);
      formData.append('field', field);

      try {
        const response = await axios.post('http://localhost:8080/api/s3/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log(`${field} upload result:`, response.data);
        if (response.data.success) {
          alert(`${field} uploaded successfully!`);
        } else {
          alert(`Error uploading ${field}: ${response.data.message}`);
        }
      } catch (err) {
        console.error(`Error uploading ${field}:`, err);
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
        alert(`Error uploading ${field}: ${errorMessage}`);
      }
    } else if (type === 'text-input') {
      try {
        const response = await axios.post('http://localhost:8080/api/inputs/add', {
          project_id,
          field,
          value: data 
        });
        
        console.log(`${field} submission result:`, response.data);
        if (response.data.success) {
          alert(`${field} submitted successfully!`);
        } else {
          alert(`Error submitting ${field}: ${response.data.message}`);
        }
      } catch (err) {
        console.error(`Error submitting ${field}:`, err);
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
        alert(`Error submitting ${field}: ${errorMessage}`);
      }
    }
  };

  return (
    <div className={styles.appsPage}>
      <div className={styles.container}>
        <h2>Preload Apps Configuration</h2>
        
        <div className={styles.content}>
          <div className={styles.formSection}>
            
            {/* Preload Apps Section */}
            <div className={styles.section}>
              <h3>Preload Apps</h3>
              
              <div className={styles.inputGroup}>
                <label>App Configuration Files</label>
                <input 
                  type="file" 
                  multiple 
                  accept=".txt,.md,.csv,.json,.xml,text/plain" 
                  onChange={(e) => handleFileChange(e, setTextFiles)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(textFiles, 'text', 'preload-apps-config')}
                  className={styles.uploadButton}
                  disabled={textFiles.length === 0}
                >
                  Upload App Configuration Files
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label>App Names</label>
                <input
                  type="text"
                  value={appNames}
                  onChange={(e) => setAppNames(e.target.value)}
                  placeholder="Enter app names (comma separated)"
                  className={styles.textInput}
                />
                <button 
                  onClick={handleAppNamesSubmit}
                  className={styles.uploadButton}
                  disabled={!appNames}
                >
                  Submit App Names
                </button>
              </div>
              
            </div>

          </div>

          <div className={styles.previewSection}>
            <h3>Preview</h3>
            
            {/* Text Files Preview */}
            {renderPreview(textFiles, 'text', 'App Configuration Files')}
            
            {/* Placeholder when no files are selected */}
            {!textFiles.length && (
              <div className={styles.previewPlaceholder}>
                <p>Select files to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
