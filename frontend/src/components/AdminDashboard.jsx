import React, { useState, useEffect } from 'react';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDoctorRequests();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDoctorRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filter === 'all' ? '/api/admin/doctor-requests' : `/api/admin/doctor-requests?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctorRequests(data);
      }
    } catch (error) {
      console.error('Error fetching doctor requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/doctor-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Doctor request approved successfully!');
        fetchDoctorRequests();
        fetchStats();
        setSelectedRequest(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/doctor-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });
      
      if (response.ok) {
        alert('Doctor request rejected successfully!');
        fetchDoctorRequests();
        fetchStats();
        setSelectedRequest(null);
        setRejectionReason('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      rejected: { class: 'status-rejected', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage doctor registration requests</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>{stats.totalDoctors || 0}</h3>
            <p>Active Doctors</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤒</div>
          <div className="stat-info">
            <h3>{stats.totalPatients || 0}</h3>
            <p>Patients</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingRequests || 0}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pendingRequests || 0})
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approved ({stats.approvedRequests || 0})
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({stats.rejectedRequests || 0})
        </button>
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Requests
        </button>
      </div>

      {/* Doctor Requests Table */}
      <div className="requests-section">
        <h2>Doctor Registration Requests</h2>
        
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : doctorRequests.length === 0 ? (
          <div className="no-requests">
            <p>No {filter !== 'all' ? filter : ''} requests found.</p>
          </div>
        ) : (
          <div className="requests-table">
            {doctorRequests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="request-header">
                  <div className="doctor-info">
                    <h3>{request.name}</h3>
                    <p className="email">{request.email}</p>
                    <p className="bmdc">BMDC ID: {request.bmdcId}</p>
                  </div>
                  <div className="request-status">
                    {getStatusBadge(request.status)}
                    <p className="submit-date">Submitted: {formatDate(request.submittedAt)}</p>
                  </div>
                </div>
                
                <div className="request-details">
                  <div className="detail-item">
                    <strong>Age:</strong> {request.age || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>Gender:</strong> {request.gender || 'Not provided'}
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {request.location || 'Not provided'}
                  </div>
                  {request.reviewedAt && (
                    <div className="detail-item">
                      <strong>Reviewed:</strong> {formatDate(request.reviewedAt)}
                    </div>
                  )}
                  {request.rejectionReason && (
                    <div className="detail-item rejection-reason">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn-approve" 
                      onClick={() => handleApprove(request._id)}
                      disabled={actionLoading}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => setSelectedRequest(request)}
                      disabled={actionLoading}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Doctor Request</h3>
            <p>Are you sure you want to reject the registration request from <strong>{selectedRequest.name}</strong>?</p>
            
            <div className="form-group">
              <label htmlFor="rejectionReason">Reason for rejection:</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows="4"
                required
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setSelectedRequest(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-reject" 
                onClick={() => handleReject(selectedRequest._id)}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
