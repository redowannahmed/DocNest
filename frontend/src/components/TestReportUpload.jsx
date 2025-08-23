import { useState } from 'react';
import '../css/TestReportUploadModal.css';
import sessionManager from '../utils/SessionManager';

export default function TestReportUpload({ 
  visitId, 
  onUploadSuccess, 
  onClose 
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Please select only image files (JPEG, PNG, GIF)');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('File size should not exceed 5MB');
      return;
    }

    setSelectedFiles(files);
    setError('');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // First upload files using the existing upload endpoint
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('testReports', file);
      });
      formData.append('reportType', 'Other');

      const token = sessionManager.getToken();
      const uploadResponse = await fetch('/api/upload/test-report', {
        method: 'POST',
        headers: {
          'Authorization': token,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to upload files');
      }

      const uploadData = await uploadResponse.json();
      
      // Then save the uploaded files to the medical visit
      const response = await fetch(`/api/userdata/medical-history/${visitId}/test-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          testReports: uploadData.files,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save test reports');
      }

      const result = await response.json();
      
      // Notify parent component of success
      if (onUploadSuccess) {
        onUploadSuccess(result.medicalHistory);
      }

      // Close the modal
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload test reports');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <div className="test-report-upload-overlay" onClick={onClose}>
      <div className="test-report-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-header">
          <h3>
            <i className="fas fa-upload"></i>
            Upload Test Reports
          </h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="upload-content">
          <div className="file-input-container">
            <input
              type="file"
              id="test-report-files"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="test-report-files" className="file-input-label">
              <i className="fas fa-cloud-upload-alt"></i>
              Choose Test Report Images
            </label>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length})</h4>
              <div className="files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <i className="fas fa-file-image"></i>
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button 
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="upload-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button 
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i>
                Upload Reports
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
