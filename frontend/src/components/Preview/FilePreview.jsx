import React, { useState } from 'react';
import styles from './FilePreview.module.css';

export default function FilePreview({ url, type, fileName }) {
  const [showModal, setShowModal] = useState(false);

  const handlePreviewClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <>
      <div className={styles.previewWrapper} onClick={handlePreviewClick}>
        {type === 'image' && (
          <img 
            src={url} 
            alt="preview" 
            className={styles.preview} 
          />
        )}
        {type === 'video' && (
          <video 
            src={url} 
            className={styles.preview}
            muted
            preload="metadata"
          />
        )}
        {type === 'audio' && (
          <div className={styles.audioPreview}>
            <div className={styles.audioIcon}>🎵</div>
            <span className={styles.fileName}>{fileName || 'Audio File'}</span>
          </div>
        )}
        {type === 'text' && (
          <div className={styles.textPreview}>
            <div className={styles.textIcon}>📄</div>
            <span className={styles.fileName}>{fileName || 'Text File'}</span>
          </div>
        )}
        <div className={styles.clickOverlay}>
          <span className={styles.clickText}>Click to view full size</span>
        </div>
      </div>

      {/* Modal for full-size preview */}
      {showModal && (
        <div className={styles.modal} onClick={handleOverlayClick}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <button 
                className={styles.closeButton} 
                onClick={handleModalClose}
              >
                ×
              </button>
              <button 
                className={styles.newTabButton}
                onClick={openInNewTab}
              >
                Open in New Tab
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {type === 'image' && (
                <img 
                  src={url} 
                  alt="full size preview" 
                  className={styles.fullSizePreview}
                />
              )}
              {type === 'video' && (
                <video 
                  src={url} 
                  controls 
                  className={styles.fullSizePreview}
                  autoPlay
                />
              )}
              {type === 'audio' && (
                <div className={styles.fullSizeAudio}>
                  <audio 
                    src={url} 
                    controls 
                    className={styles.audioPlayer}
                    autoPlay
                  />
                  <div className={styles.audioInfo}>
                    <div className={styles.audioIconLarge}>🎵</div>
                    <span className={styles.fileNameLarge}>{fileName || 'Audio File'}</span>
                  </div>
                </div>
              )}
              {type === 'text' && (
                <iframe 
                  src={url} 
                  title="text-file" 
                  className={styles.fullSizePreview}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
