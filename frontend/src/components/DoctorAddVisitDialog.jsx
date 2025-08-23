import { useEffect, useMemo, useState } from 'react';
import '../css/MedicalHistoryDialog.css';

export default function DoctorAddVisitDialog({
  isOpen,
  onClose,
  accessCode,
  onSaved
}) {
  const [form, setForm] = useState({
    date: '',
    doctor: '',
    specialty: '',
    reason: '',
    status: 'Completed',
    notes: '',
    digitalPrescription: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
      advice: '',
      tests: [],
      followUpDate: ''
    }
  });
  const [testInput, setTestInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({ ...prev, doctor: prev.doctor || '' }));
    }
  }, [isOpen]);

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const updateRx = (idx, key, value) => {
    setForm((f) => {
      const meds = [...(f.digitalPrescription?.medications || [])];
      meds[idx] = { ...meds[idx], [key]: value };
      return { ...f, digitalPrescription: { ...f.digitalPrescription, medications: meds } };
    });
  };

  const addRx = () => {
    setForm((f) => ({
      ...f,
      digitalPrescription: {
        ...f.digitalPrescription,
        medications: [...(f.digitalPrescription?.medications || []), { name: '', dosage: '', frequency: '', duration: '', notes: '' }]
      }
    }));
  };

  const removeRx = (idx) => {
    setForm((f) => ({
      ...f,
      digitalPrescription: {
        ...f.digitalPrescription,
        medications: (f.digitalPrescription?.medications || []).filter((_, i) => i !== idx)
      }
    }));
  };

  const addTest = () => {
    const t = testInput.trim();
    if (!t) return;
    setForm((f) => ({
      ...f,
      digitalPrescription: { ...f.digitalPrescription, tests: [ ...(f.digitalPrescription?.tests || []), t ] }
    }));
    setTestInput('');
  };

  const removeTest = (idx) => {
    setForm((f) => ({
      ...f,
      digitalPrescription: {
        ...f.digitalPrescription,
        tests: (f.digitalPrescription?.tests || []).filter((_, i) => i !== idx)
      }
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Prevent future date
    const selected = new Date(form.date);
    const today = new Date();
    selected.setHours(0,0,0,0); today.setHours(0,0,0,0);
    if (selected > today) {
      alert('Visit date cannot be in the future');
      return;
    }

    setSaving(true);
    try {
      const token = (await import('../utils/SessionManager')).default.getToken();
      const res = await fetch(`/api/patient-access/patients/${accessCode}/medical-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add medical visit');
      }
      const data = await res.json();
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error('Add visit failed', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Add Medical Visit (Digital Prescription)</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="dialog-form">
          <div className="tab-content dialog-scroll">
            <div className="form-row">
              <div className="form-group">
                <label>Visit Date *</label>
                <input type="date" name="date" value={form.date} onChange={update} max={todayStr} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={update}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Doctor Name *</label>
                <input name="doctor" value={form.doctor} onChange={update} placeholder="Dr. Jane Doe" required />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <input name="specialty" value={form.specialty} onChange={update} placeholder="Cardiology" />
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Visit *</label>
              <input name="reason" value={form.reason} onChange={update} placeholder="Follow-up, diagnosis, etc." required />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={update} rows={3} />
            </div>

            <hr />
            <h3>Digital Prescription</h3>

            {(form.digitalPrescription?.medications || []).map((rx, idx) => (
              <div key={idx} className="rx-row">
                <div className="form-row">
                  <div className="form-group">
                    <label>Medicine Name *</label>
                    <input value={rx.name} onChange={(e) => updateRx(idx, 'name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input value={rx.dosage || ''} onChange={(e) => updateRx(idx, 'dosage', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Frequency</label>
                    <input value={rx.frequency || ''} onChange={(e) => updateRx(idx, 'frequency', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input value={rx.duration || ''} onChange={(e) => updateRx(idx, 'duration', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <input value={rx.notes || ''} onChange={(e) => updateRx(idx, 'notes', e.target.value)} />
                </div>
                <div className="form-row">
                  <button type="button" className="btn-secondary" onClick={() => removeRx(idx)}>Remove</button>
                </div>
                <hr />
              </div>
            ))}
            <div className="form-row">
              <button type="button" className="btn-secondary" onClick={addRx}>+ Add Medicine</button>
            </div>

            <div className="form-group">
              <label>Advice / Instructions</label>
              <textarea value={form.digitalPrescription?.advice || ''} onChange={(e) => setForm((f) => ({ ...f, digitalPrescription: { ...f.digitalPrescription, advice: e.target.value } }))} rows={3} />
            </div>

            <div className="form-group">
              <label>Tests</label>
              <div className="tests-input">
                <input value={testInput} onChange={(e) => setTestInput(e.target.value)} placeholder="Add a test (e.g., CBC)" />
                <button type="button" className="btn-secondary" onClick={addTest}>Add</button>
              </div>
              <div className="chips">
                {(form.digitalPrescription?.tests || []).map((t, idx) => (
                  <span key={idx} className="chip">
                    {t}
                    <button type="button" onClick={() => removeTest(idx)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Follow-up Date</label>
              <input type="date" value={form.digitalPrescription?.followUpDate || ''} onChange={(e) => setForm((f) => ({ ...f, digitalPrescription: { ...f.digitalPrescription, followUpDate: e.target.value } }))} />
            </div>
          </div>

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Visit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
