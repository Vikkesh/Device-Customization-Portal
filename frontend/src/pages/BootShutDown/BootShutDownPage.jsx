import React, { useState } from 'react';
import styles from './BootShutDownPage.module.css';
import FilePreview from '../../components/Preview/FilePreview';

export default function BootShutDownPage() {
  const [bootAnimation, setBootAnimation] = useState(null);
  const [bootSound, setBootSound] = useState(null);
  const [shutdownAnimation, setShutdownAnimation] = useState(null);
  const [shutdownSound, setShutdownSound] = useState(null);

  const handleSingleFileChange = (e, setter) => {
    const selected = e.target.files[0];
    setter(selected);
  };

  const renderPreview = (files, type, label) => {
    if (!files || (Array.isArray(files) && files.length === 0) || (!Array.isArray(files) && !files)) {
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

  const handleSubmit = async (data, type, field) => {
    const formData = new FormData();

    if (['image', 'audio', 'video', 'text'].includes(type)) {
      formData.append('files', data);
      formData.append('type', type);
      formData.append('field', field);
    } else if (type === 'text-input') {
      formData.append('type', type);
      formData.append('field', field);
      formData.append('value', data);
    }

    try {
      // Placeholder API call
      const res = await fetch('http://localhost:5000/api/boot-shutdown', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      console.log(`${field} upload result:`, result);
      alert(`${field} uploaded successfully!`);
    } catch (err) {
      console.error(`Error uploading ${field}:`, err);
      alert(`Error uploading ${field}`);
    }
  };

  return (
    <div className={styles.bootShutDownPage}>
      <div className={styles.container}>
        <h2>Boot & Shutdown Customization</h2>
        
        <div className={styles.content}>
          <div className={styles.formSection}>
            
            {/* Boot Section */}
            <div className={styles.section}>
              <h3>Boot Customization</h3>
              
              <div className={styles.inputGroup}>
                <label>Boot Animation</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={(e) => handleSingleFileChange(e, setBootAnimation)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(bootAnimation, 'video', 'boot-animation')}
                  className={styles.uploadButton}
                  disabled={!bootAnimation}
                >
                  Upload Boot Animation
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label>Boot Sound</label>
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={(e) => handleSingleFileChange(e, setBootSound)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(bootSound, 'audio', 'boot-sound')}
                  className={styles.uploadButton}
                  disabled={!bootSound}
                >
                  Upload Boot Sound
                </button>
              </div>
            </div>

            {/* Shutdown Section */}
            <div className={styles.section}>
              <h3>Shutdown Customization</h3>
              
              <div className={styles.inputGroup}>
                <label>Shutdown Animation</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={(e) => handleSingleFileChange(e, setShutdownAnimation)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(shutdownAnimation, 'video', 'shutdown-animation')}
                  className={styles.uploadButton}
                  disabled={!shutdownAnimation}
                >
                  Upload Shutdown Animation
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label>Shutdown Sound</label>
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={(e) => handleSingleFileChange(e, setShutdownSound)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(shutdownSound, 'audio', 'shutdown-sound')}
                  className={styles.uploadButton}
                  disabled={!shutdownSound}
                >
                  Upload Shutdown Sound
                </button>
              </div>
            </div>

          </div>

          <div className={styles.previewSection}>
            <h3>Preview</h3>
            
            {/* Boot Animation Preview */}
            {renderPreview(bootAnimation, 'video', 'Boot Animation')}
            
            {/* Boot Sound Preview */}
            {renderPreview(bootSound, 'audio', 'Boot Sound')}
            
            {/* Shutdown Animation Preview */}
            {renderPreview(shutdownAnimation, 'video', 'Shutdown Animation')}
            
            {/* Shutdown Sound Preview */}
            {renderPreview(shutdownSound, 'audio', 'Shutdown Sound')}
            
            {/* Placeholder when no files are selected */}
            {!bootAnimation && !bootSound && !shutdownAnimation && !shutdownSound && (
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
