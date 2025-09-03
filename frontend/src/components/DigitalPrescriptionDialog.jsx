import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Pill, Calendar, FileText } from 'lucide-react';
import '../css/DigitalPrescriptionDialog.css';

export default function DigitalPrescriptionDialog({ isOpen, onClose, patientData, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [visitData, setVisitData] = useState({
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    specialty: '',
    reason: '',
    status: 'Completed',
    notes: '',
    digitalPrescription: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
      advice: '',
      tests: [],
      followUpDate: '',
      additionalNotes: ''
    }
  });

  const [newTest, setNewTest] = useState('');

  if (!isOpen) return null;

  const addMedication = () => {
    setVisitData(prev => ({
      ...prev,
      digitalPrescription: {
        ...prev.digitalPrescription,
        medications: [...prev.digitalPrescription.medications, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]
      }
    }));
  };

  const removeMedication = (index) => {
    setVisitData(prev => ({
      ...prev,
      digitalPrescription: {
        ...prev.digitalPrescription,
        medications: prev.digitalPrescription.medications.filter((_, i) => i !== index)
      }
    }));
  };

  const updateMedication = (index, field, value) => {
    setVisitData(prev => ({
      ...prev,
      digitalPrescription: {
        ...prev.digitalPrescription,
        medications: prev.digitalPrescription.medications.map((med, i) => 
          i === index ? { ...med, [field]: value } : med
        )
      }
    }));
  };

  const addTest = () => {
    if (newTest.trim()) {
      setVisitData(prev => ({
        ...prev,
        digitalPrescription: {
          ...prev.digitalPrescription,
          tests: [...prev.digitalPrescription.tests, newTest.trim()]
        }
      }));
      setNewTest('');
    }
  };

  const removeTest = (index) => {
    setVisitData(prev => ({
      ...prev,
      digitalPrescription: {
        ...prev.digitalPrescription,
        tests: prev.digitalPrescription.tests.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!visitData.date || !visitData.doctor || !visitData.reason) {
      alert('Please fill in all required fields: Date, Doctor, and Reason for Visit');
      setLoading(false);
      return;
    }

    // Validate at least one medication has a name
    const hasValidMedication = visitData.digitalPrescription.medications.some(med => med.name.trim() !== '');
    if (!hasValidMedication) {
      alert('Please add at least one medication with a name');
      setLoading(false);
      return;
    }

    // Filter out empty medications (medications with no name)
    const filteredMedications = visitData.digitalPrescription.medications.filter(med => med.name.trim() !== '');
    
    console.log('=== PRESCRIPTION DEBUG ===');
    console.log('Original medications:', visitData.digitalPrescription.medications);
    console.log('Filtered medications:', filteredMedications);
    console.log('Tests array:', visitData.digitalPrescription.tests);
    console.log('Tests length:', visitData.digitalPrescription.tests.length);
    console.log('Follow-up date:', visitData.digitalPrescription.followUpDate);
    console.log('Advice:', visitData.digitalPrescription.advice);
    console.log('Full digital prescription object:', visitData.digitalPrescription);
    console.log('Current visitData before validation:', visitData);

    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      console.log('Current logged in user:', userInfo);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const requestData = {
        ...visitData,
        digitalPrescription: {
          ...visitData.digitalPrescription,
          medications: filteredMedications // Use filtered medications
        },
        prescriptionImgs: [],
        testReports: []
      };
      
      console.log('Sending prescription data:', requestData);
      console.log('Access code:', patientData.accessCode);
      
      const response = await fetch(`http://localhost:5000/api/patient-access/patients/${patientData.accessCode}/medical-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const newVisit = await response.json();
        onSaved(newVisit);
        onClose();
        
        // Reset form
        setVisitData({
          date: new Date().toISOString().split('T')[0],
          doctor: '',
          specialty: '',
          reason: '',
          status: 'Completed',
          notes: '',
          digitalPrescription: {
            medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
            advice: '',
            tests: [],
            followUpDate: '',
            additionalNotes: ''
          }
        });
      } else {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        console.error('Response Status:', response.status);
        throw new Error(`Failed to save prescription: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert(`Failed to save prescription: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="digital-prescription-overlay">
      <div className="digital-prescription-modal">
        <div className="digital-prescription-header">
          <div className="digital-prescription-header-content">
            <div className="digital-prescription-header-left">
              <div className="digital-prescription-icon-box">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="digital-prescription-title">Digital Prescription</h3>
                <p className="digital-prescription-subtitle">
                  Patient: {patientData?.patient?.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="digital-prescription-close-btn">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="digital-prescription-form">
          {/* Basic Visit Info */}
          <div className="digital-prescription-section">
            <div className="digital-prescription-grid">
              <div className="digital-prescription-field">
                <label className="digital-prescription-label">Visit Date</label>
                <input
                  type="date"
                  value={visitData.date}
                  onChange={(e) => setVisitData({ ...visitData, date: e.target.value })}
                  required
                  className="digital-prescription-input"
                />
              </div>
              <div className="digital-prescription-field">
                <label className="digital-prescription-label">Doctor</label>
                <input
                  type="text"
                  placeholder="Doctor name"
                  value={visitData.doctor}
                  onChange={(e) => setVisitData({ ...visitData, doctor: e.target.value })}
                  required
                  className="digital-prescription-input"
                />
              </div>
              <div className="digital-prescription-field">
                <label className="digital-prescription-label">Specialty</label>
                <input
                  type="text"
                  placeholder="Medical specialty"
                  value={visitData.specialty}
                  onChange={(e) => setVisitData({ ...visitData, specialty: e.target.value })}
                  className="digital-prescription-input"
                />
              </div>
              <div className="digital-prescription-field">
                <label className="digital-prescription-label">Reason for Visit</label>
                <input
                  type="text"
                  placeholder="Consultation reason"
                  value={visitData.reason}
                  onChange={(e) => setVisitData({ ...visitData, reason: e.target.value })}
                  required
                  className="digital-prescription-input"
                />
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div className="digital-prescription-section">
            <div className="medications-section-header">
              <Pill className="w-5 h-5 text-purple-600" />
              <h4 className="medications-section-title">Prescribed Medications</h4>
            </div>
            
            {visitData.digitalPrescription.medications.map((medication, index) => (
              <div key={index} className="medication-card">
                <div className="medication-card-header">
                  <h5 className="medication-card-title">Medication {index + 1}</h5>
                  {visitData.digitalPrescription.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="medication-remove-btn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="medication-fields-grid">
                  <div className="digital-prescription-field">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      required
                      className="digital-prescription-input"
                    />
                  </div>
                  <div className="digital-prescription-field">
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 10mg)"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="digital-prescription-input"
                    />
                  </div>
                  <div className="digital-prescription-field">
                    <input
                      type="text"
                      placeholder="Frequency (e.g., once a day)"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="digital-prescription-input"
                    />
                  </div>
                  <div className="digital-prescription-field">
                    <input
                      type="text"
                      placeholder="Duration (e.g., 1 month)"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="digital-prescription-input"
                    />
                  </div>
                  <div className="digital-prescription-field medication-notes-field">
                    <input
                      type="text"
                      placeholder="Additional notes for this medication"
                      value={medication.notes}
                      onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                      className="digital-prescription-input"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addMedication}
              className="add-medication-btn"
            >
              <Plus className="w-4 h-4" />
              Add Another Medication
            </button>
          </div>

          {/* Recommended Tests */}
          <div className="digital-prescription-section">
            <h4 className="tests-section-title">Recommended Tests</h4>
            
            <div className="test-input-row">
              <input
                type="text"
                placeholder="Add a test (e.g., CBC, ECG)"
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                className="test-input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTest())}
              />
              <button
                type="button"
                onClick={addTest}
                className="add-test-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {visitData.digitalPrescription.tests.length > 0 && (
              <div className="tests-list">
                {visitData.digitalPrescription.tests.map((test, index) => (
                  <div key={index} className="test-tag">
                    <span>{test}</span>
                    <button
                      type="button"
                      onClick={() => removeTest(index)}
                      className="test-remove-btn"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up Date */}
          <div className="digital-prescription-section">
            <div className="followup-section-header">
              <Calendar className="w-5 h-5 text-purple-600" />
              <label className="followup-section-title">Follow-up Date</label>
            </div>
            <input
              type="date"
              value={visitData.digitalPrescription.followUpDate}
              onChange={(e) => setVisitData({
                ...visitData,
                digitalPrescription: {
                  ...visitData.digitalPrescription,
                  followUpDate: e.target.value
                }
              })}
              className="digital-prescription-input"
            />
          </div>

          {/* Additional Advice */}
          <div className="digital-prescription-section">
            <label className="digital-prescription-label">Medical Advice</label>
            <textarea
              placeholder="General advice for the patient..."
              value={visitData.digitalPrescription.advice}
              onChange={(e) => setVisitData({
                ...visitData,
                digitalPrescription: {
                  ...visitData.digitalPrescription,
                  advice: e.target.value
                }
              })}
              rows="3"
              className="digital-prescription-textarea"
            />
          </div>

          {/* Additional Notes */}
          <div className="digital-prescription-section">
            <label className="digital-prescription-label">Additional Notes</label>
            <textarea
              placeholder="Any additional notes about the visit..."
              value={visitData.digitalPrescription.additionalNotes}
              onChange={(e) => setVisitData({
                ...visitData,
                digitalPrescription: {
                  ...visitData.digitalPrescription,
                  additionalNotes: e.target.value
                }
              })}
              rows="3"
              className="digital-prescription-textarea"
            />
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="save-btn"
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  Saving Prescription...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Digital Prescription
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
