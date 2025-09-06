import React, { useEffect, useState } from 'react';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import '../styles/AdminCompanies.css';

const AdminCompanyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    displayName: '',
    logo: '',
    website: '',
    linkedinUrl: '',
    industry: '',
    size: '',
    aliases: '',
    isVerified: false
  });

  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showStateChangeModal, setShowStateChangeModal] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAdminAuth(`/api/admin/company-requests?status=${viewMode}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRequests(data.data);
    } catch {
      setError('Failed to fetch company requests');
    }
    setLoading(false);
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setCompanyForm({
      displayName: request.companyName,
      logo: '',
      website: '',
      linkedinUrl: '',
      industry: '',
      size: '',
      aliases: '',
      isVerified: false
    });
    setShowApprovalModal(true);
  };

  const openRejectionModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const openStateChangeModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowStateChangeModal(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest._id);
    try {
      const response = await fetchWithAdminAuth(`/api/admin/company-requests/${selectedRequest._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyData: {
            ...companyForm,
            aliases: companyForm.aliases.split(',').map(a => a.trim()).filter(Boolean)
          }
        })
      });
      
      if (!response.ok) throw new Error();
      
      await fetchRequests();
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch {
      setError('Failed to approve company request');
    }
    setProcessingId(null);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest._id);
    try {
      const response = await fetchWithAdminAuth(`/api/admin/company-requests/${selectedRequest._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });
      
      if (!response.ok) throw new Error();
      
      await fetchRequests();
      setShowRejectionModal(false);
      setSelectedRequest(null);
    } catch {
      setError('Failed to reject company request');
    }
    setProcessingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedRequest) return;
    
    setProcessingId(selectedRequest._id);
    try {
      const response = await fetchWithAdminAuth(`/api/admin/company-requests/${selectedRequest._id}/change-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newStatus, 
          reason: rejectionReason || `Status changed to ${newStatus} by admin`
        })
      });
      
      if (!response.ok) throw new Error();
      
      await fetchRequests();
      setShowStateChangeModal(false);
      setSelectedRequest(null);
    } catch {
      setError('Failed to change request status');
    }
    setProcessingId(null);
  };

  useEffect(() => { fetchRequests(); }, [viewMode]);

  return (
    <div className="admin-companies-container">
      <div className="admin-companies-header">
        <h2>Company Creation Requests</h2>
        <button className="admin-companies-btn admin-companies-btn-secondary" onClick={fetchRequests}>
          Refresh
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="admin-companies-tabs">
        <button 
          className={`admin-companies-tab ${viewMode === 'pending' ? 'active' : ''}`}
          onClick={() => setViewMode('pending')}
        >
          Pending
        </button>
        <button 
          className={`admin-companies-tab ${viewMode === 'approved' ? 'active' : ''}`}
          onClick={() => setViewMode('approved')}
        >
          Approved
        </button>
        <button 
          className={`admin-companies-tab ${viewMode === 'rejected' ? 'active' : ''}`}
          onClick={() => setViewMode('rejected')}
        >
          Rejected
        </button>
        <button 
          className={`admin-companies-tab ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="admin-companies-loading">Loading requests...</div>
      ) : error ? (
        <div className="admin-companies-error">{error}</div>
      ) : (
        <div className="admin-companies-table-wrapper">
          {requests.length === 0 ? (
            <div className="admin-companies-empty">No pending company requests</div>
          ) : (
            <table className="admin-companies-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Requested By</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request._id}>
                    <td>
                      <strong>{request.companyName}</strong>
                    </td>
                    <td>{request.requestedBy}</td>
                    <td>{request.requestedByEmail}</td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status === 'pending' ? 'Pending' : 
                         request.status === 'approved' ? 'Approved' : 
                         request.status === 'rejected' ? 'Rejected' : 
                         request.status}
                      </span>
                      {request.processedAt && (
                        <div className="processed-date">
                          {new Date(request.processedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td>
                      {request.status === 'pending' ? (
                        <>
                          <button 
                            className="admin-companies-btn admin-companies-btn-primary admin-companies-btn-small"
                            onClick={() => openApprovalModal(request)}
                            disabled={processingId === request._id}
                            style={{ marginRight: 8 }}
                          >
                            {processingId === request._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button 
                            className="admin-companies-btn admin-companies-btn-danger admin-companies-btn-small"
                            onClick={() => openRejectionModal(request)}
                            disabled={processingId === request._id}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          className="admin-companies-btn admin-companies-btn-secondary admin-companies-btn-small"
                          onClick={() => openStateChangeModal(request)}
                          disabled={processingId === request._id}
                        >
                          Change Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="admin-companies-modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="admin-companies-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Approve Company: {selectedRequest.companyName}</h3>
            <p>Requested by: <strong>{selectedRequest.requestedBy}</strong></p>
            
            <form onSubmit={handleApprove} className="admin-companies-modal-form">
              <input 
                name="displayName" 
                placeholder="Display Name*" 
                value={companyForm.displayName} 
                onChange={handleFormChange} 
                required 
              />
              <input 
                name="logo" 
                placeholder="Logo URL" 
                value={companyForm.logo} 
                onChange={handleFormChange} 
              />
              <input 
                name="website" 
                placeholder="Website" 
                value={companyForm.website} 
                onChange={handleFormChange} 
              />
              <input 
                name="linkedinUrl" 
                placeholder="LinkedIn URL" 
                value={companyForm.linkedinUrl} 
                onChange={handleFormChange} 
              />
              <input 
                name="industry" 
                placeholder="Industry" 
                value={companyForm.industry} 
                onChange={handleFormChange} 
              />
              <input 
                name="size" 
                placeholder="Company Size" 
                value={companyForm.size} 
                onChange={handleFormChange} 
              />
              <input 
                name="aliases" 
                placeholder="Aliases (comma separated)" 
                value={companyForm.aliases} 
                onChange={handleFormChange} 
              />
              <label className="admin-companies-checkbox-label">
                <input 
                  type="checkbox" 
                  name="isVerified" 
                  checked={companyForm.isVerified} 
                  onChange={handleFormChange} 
                /> 
                Verified Company
              </label>
              
              <div className="admin-companies-modal-actions">
                <button 
                  type="submit" 
                  className="admin-companies-btn admin-companies-btn-primary"
                  disabled={processingId === selectedRequest._id}
                >
                  {processingId === selectedRequest._id ? 'Creating...' : 'Create Company'}
                </button>
                <button 
                  type="button" 
                  className="admin-companies-btn" 
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="admin-companies-modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <div className="admin-companies-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Reject Company Request</h3>
            <p>Company: <strong>{selectedRequest.companyName}</strong></p>
            <p>Requested by: <strong>{selectedRequest.requestedBy}</strong></p>
            
            <form onSubmit={handleReject} className="admin-companies-modal-form">
              <textarea
                placeholder="Rejection reason (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              
              <div className="admin-companies-modal-actions">
                <button 
                  type="submit" 
                  className="admin-companies-btn admin-companies-btn-danger"
                  disabled={processingId === selectedRequest._id}
                >
                  {processingId === selectedRequest._id ? 'Rejecting...' : 'Reject Request'}
                </button>
                <button 
                  type="button" 
                  className="admin-companies-btn" 
                  onClick={() => setShowRejectionModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* State Change Modal */}
      {showStateChangeModal && selectedRequest && (
        <div className="admin-companies-modal-overlay" onClick={() => setShowStateChangeModal(false)}>
          <div className="admin-companies-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Change Request Status</h3>
            <p>Company: <strong>{selectedRequest.companyName}</strong></p>
            <p>Requested by: <strong>{selectedRequest.requestedBy}</strong></p>
            <p>Current Status: <span className={`status-badge status-${selectedRequest.status}`}>
              {selectedRequest.status === 'pending' ? 'Pending' : 
               selectedRequest.status === 'approved' ? 'Approved' : 
               selectedRequest.status === 'rejected' ? 'Rejected' : 
               selectedRequest.status}
            </span></p>
            
            {selectedRequest.rejectionReason && (
              <p>Previous Reason: <em>{selectedRequest.rejectionReason}</em></p>
            )}
            
            <div className="admin-companies-modal-form">
              <textarea
                placeholder="Reason for status change (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              
              <div className="status-change-buttons">
                <button 
                  className="admin-companies-btn admin-companies-btn-secondary"
                  onClick={() => handleStatusChange('pending')}
                  disabled={processingId === selectedRequest._id || selectedRequest.status === 'pending'}
                >
                  Set as Pending
                </button>
                <button 
                  className="admin-companies-btn admin-companies-btn-primary"
                  onClick={() => handleStatusChange('approved')}
                  disabled={processingId === selectedRequest._id || selectedRequest.status === 'approved'}
                >
                  Set as Approved
                </button>
                <button 
                  className="admin-companies-btn admin-companies-btn-danger"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={processingId === selectedRequest._id || selectedRequest.status === 'rejected'}
                >
                  Set as Rejected
                </button>
              </div>
              
              <div className="admin-companies-modal-actions" style={{ marginTop: '1rem' }}>
                <button 
                  type="button" 
                  className="admin-companies-btn" 
                  onClick={() => setShowStateChangeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanyRequests;
