import React, { useState } from 'react';
import styles from './HomeThemePage.module.css';
import FilePreview from '../../components/Preview/FilePreview';

export default function HomeThemePage() {
  const [wallpaperHomescreen, setWallpaperHomescreen] = useState([]);
  const [wallpaperLockscreen, setWallpaperLockscreen] = useState([]);
  const [launcher, setLauncher] = useState('');
  const [icon, setIcon] = useState(null);
  const [bookmark, setBookmark] = useState([]);
  const [ringtone, setRingtone] = useState([]);

  const launcherOptions = [
    'Nova Launcher',
    'Microsoft Launcher',
    'Action Launcher',
    'Lawnchair',
    'Apex Launcher',
    'Custom'
  ];

  const handleFileChange = (e, setter) => {
    const selected = Array.from(e.target.files);
    setter(selected);
  };

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
      if (Array.isArray(data)) {
        data.forEach(file => formData.append('files', file));
      } else {
        formData.append('files', data);
      }
      formData.append('type', type);
      formData.append('field', field);
    } else if (type === 'text-input') {
      formData.append('type', type);
      formData.append('field', field);
      formData.append('value', data);
    }

    try {
      // Placeholder API call
      const res = await fetch('http://localhost:5000/api/home-theme', {
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
    <div className={styles.homeThemePage}>
      <div className={styles.container}>
        <h2>Home Theme Customization</h2>
        
        <div className={styles.content}>
          <div className={styles.formSection}>
            
            {/* Wallpaper Section */}
            <div className={styles.section}>
              <h3>Wallpapers</h3>
              
              <div className={styles.inputGroup}>
                <label>Homescreen Wallpapers</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, setWallpaperHomescreen)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(wallpaperHomescreen, 'image', 'wallpaper-homescreen')}
                  className={styles.uploadButton}
                  disabled={wallpaperHomescreen.length === 0}
                >
                  Upload Homescreen Wallpapers
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label>Lockscreen Wallpapers</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, setWallpaperLockscreen)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(wallpaperLockscreen, 'image', 'wallpaper-lockscreen')}
                  className={styles.uploadButton}
                  disabled={wallpaperLockscreen.length === 0}
                >
                  Upload Lockscreen Wallpapers
                </button>
              </div>

              
            </div>

            {/* Launcher Section */}
            <div className={styles.section}>
              <h3>Launcher</h3>
              <div className={styles.inputGroup}>
                <div className={styles.launcherContainer}>
                  <input
                    type="text"
                    value={launcher}
                    onChange={(e) => setLauncher(e.target.value)}
                    placeholder="Enter custom launcher name"
                    className={styles.textInput}
                  />
                  <select
                    value={launcher}
                    onChange={(e) => setLauncher(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="">Select launcher</option>
                    {launcherOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => handleSubmit(launcher, 'text-input', 'launcher')}
                  className={styles.uploadButton}
                  disabled={!launcher}
                >
                  Set Launcher
                </button>
              </div>
            </div>

            {/* Icon Section */}
            <div className={styles.section}>
              <h3>App Icon</h3>
              <div className={styles.inputGroup}>
                <label>Custom Icon</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleSingleFileChange(e, setIcon)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(icon, 'image', 'app-icon')}
                  className={styles.uploadButton}
                  disabled={!icon}
                >
                  Upload Icon
                </button>
              </div>

             
            </div>

            {/* Bookmark Section */}
            <div className={styles.section}>
              <h3>Bookmarks</h3>
              <div className={styles.inputGroup}>
                <label>Bookmark Files</label>
                <input 
                  type="file" 
                  multiple 
                  accept=".txt,.md,.csv,text/plain" 
                  onChange={(e) => handleFileChange(e, setBookmark)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(bookmark, 'text', 'bookmarks')}
                  className={styles.uploadButton}
                  disabled={bookmark.length === 0}
                >
                  Upload Bookmarks
                </button>
              </div>

            
            </div>

            {/* Ringtone Section */}
            <div className={styles.section}>
              <h3>Ringtones</h3>
              <div className={styles.inputGroup}>
                <label>Audio Files</label>
                <input 
                  type="file" 
                  multiple 
                  accept="audio/*" 
                  onChange={(e) => handleFileChange(e, setRingtone)} 
                  className={styles.fileInput}
                />
                <button 
                  onClick={() => handleSubmit(ringtone, 'audio', 'ringtones')}
                  className={styles.uploadButton}
                  disabled={ringtone.length === 0}
                >
                  Upload Ringtones
                </button>
              </div>

              
            </div>

          </div>

          <div className={styles.previewSection}>
            <h3>Preview</h3>
            
            {/* Wallpaper Previews */}
            {renderPreview(wallpaperHomescreen, 'image', 'Homescreen Wallpapers')}
            {renderPreview(wallpaperLockscreen, 'image', 'Lockscreen Wallpapers')}
            
            {/* Launcher Preview */}
            {launcher && (
              <div className={styles.previewGroup}>
                <h4>Selected Launcher</h4>
                <div className={styles.launcherPreview}>
                  <span className={styles.launcherName}>{launcher}</span>
                </div>
              </div>
            )}
            
            {/* Icon Preview */}
            {renderPreview(icon, 'image', 'App Icon')}
            
            {/* Bookmark Previews */}
            {renderPreview(bookmark, 'text', 'Bookmarks')}
            
            {/* Ringtone Previews */}
            {renderPreview(ringtone, 'audio', 'Ringtones')}
            
            {/* Placeholder when no files are selected */}
            {!wallpaperHomescreen.length && !wallpaperLockscreen.length && !launcher && !icon && !bookmark.length && !ringtone.length && (
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
