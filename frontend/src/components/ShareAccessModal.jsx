import { useState, useEffect } from 'react';
import '../css/ShareAccessModal.css';

export default function ShareAccessModal({ isOpen, onClose }) {
  const [visits, setVisits] = useState([]);
  const [selectedHiddenVisits, setSelectedHiddenVisits] = useState(new Set());
  const [step, setStep] = useState(1); // 1: selection, 2: confirmation, 3: code display
  const [accessCode, setAccessCode] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVisits();
      setStep(1);
      setSelectedHiddenVisits(new Set());
      setAccessCode('');
      setExpiresAt(null);
      setError('');
    }
  }, [isOpen]);

  const fetchVisits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient-access/medical-visits-for-sharing', {
        headers: { Authorization: token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      } else {
        setError('Failed to load medical visits');
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      setError('Failed to load medical visits');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleVisitToggle = (visitId) => {
    const newSelected = new Set(selectedHiddenVisits);
    if (newSelected.has(visitId)) {
      newSelected.delete(visitId);
    } else {
      newSelected.add(visitId);
    }
    setSelectedHiddenVisits(newSelected);
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      generateAccessCode();
    }
  };

  const generateAccessCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/patient-access/generate-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({
          hiddenVisitIds: Array.from(selectedHiddenVisits)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAccessCode(data.accessCode);
        setExpiresAt(data.expiresAt);
        setStep(3);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate access code');
      }
    } catch (error) {
      console.error('Error generating access code:', error);
      setError('Failed to generate access code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedHiddenVisits(new Set());
    setAccessCode('');
    setExpiresAt(null);
    setError('');
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(accessCode);
    // You could add a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content share-access-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Medical Profile Access</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="step-content">
            <div className="step-header">
              <h3>Select Medical Visits to Hide</h3>
              <p>Choose which medical visits you want to keep private. All other information will be shared.</p>
            </div>

            <div className="visits-list">
              {visits.length === 0 ? (
                <p className="no-visits">No medical visits found.</p>
              ) : (
                visits.map(visit => (
                  <div key={visit._id} className="visit-item">
                    <label className="visit-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedHiddenVisits.has(visit._id)}
                        onChange={() => handleVisitToggle(visit._id)}
                      />
                      <div className="visit-info">
                        <div className="visit-primary">
                          <span className="visit-date">{formatDate(visit.date)}</span>
                          <span className="visit-doctor">Dr. {visit.doctor}</span>
                        </div>
                        <div className="visit-secondary">
                          <span className="visit-reason">{visit.reason}</span>
                          {visit.specialty && <span className="visit-specialty">{visit.specialty}</span>}
                          <span className={`visit-status status-${visit.status?.toLowerCase()}`}>
                            {visit.status}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleContinue}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="step-header">
              <h3>Confirm Sharing Details</h3>
            </div>

            <div className="sharing-summary">
              <div className="summary-item">
                <span className="summary-label">Total Medical Visits:</span>
                <span className="summary-value">{visits.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Visits to Hide:</span>
                <span className="summary-value">{selectedHiddenVisits.size}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Visits to Share:</span>
                <span className="summary-value">{visits.length - selectedHiddenVisits.size}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Access Duration:</span>
                <span className="summary-value">30 minutes</span>
              </div>
            </div>

            <div className="sharing-info">
              <h4>What will be shared:</h4>
              <ul>
                <li>Your chronic conditions</li>
                <li>Current medications</li>
                <li>Selected medical visits (including prescriptions and test reports)</li>
                <li>Basic profile information</li>
              </ul>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleContinue}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Access Code'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && accessCode && (
          <div className="step-content">
            <div className="step-header">
              <h3>Access Code Generated</h3>
              <p>Share this code with your doctor. It will expire in 30 minutes.</p>
            </div>

            <div className="access-code-display">
              <div className="access-code">
                {accessCode}
              </div>
              <button className="copy-btn" onClick={copyToClipboard}>
                📋 Copy Code
              </button>
            </div>

            <div className="code-info">
              <div className="info-item">
                <span className="info-label">Expires at:</span>
                <span className="info-value">
                  {expiresAt && new Date(expiresAt).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Hidden visits:</span>
                <span className="info-value">{selectedHiddenVisits.size}</span>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
