import React, { useEffect, useState } from 'react';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import PSGNotification from '../../components/PSGNotification';
import { 
  Building2, 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Mail,
  Calendar,
  Settings,
  Loader,
  MessageSquare,
  Globe,
  ExternalLink,
  Shield
} from 'lucide-react';

const AdminCompanyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

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
      setNotification({ 
        open: true, 
        message: 'Company request approved and company created successfully!', 
        type: 'success' 
      });
    } catch {
      setError('Failed to approve company request');
      setNotification({ 
        open: true, 
        message: 'Failed to approve company request', 
        type: 'error' 
      });
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
      setNotification({ 
        open: true, 
        message: 'Company request rejected successfully!', 
        type: 'success' 
      });
    } catch {
      setError('Failed to reject company request');
      setNotification({ 
        open: true, 
        message: 'Failed to reject company request', 
        type: 'error' 
      });
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
      setNotification({ 
        open: true, 
        message: `Request status changed to ${newStatus} successfully!`, 
        type: 'success' 
      });
    } catch {
      setError('Failed to change request status');
      setNotification({ 
        open: true, 
        message: 'Failed to change request status', 
        type: 'error' 
      });
    }
    setProcessingId(null);
  };

  useEffect(() => { fetchRequests(); }, [viewMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PSGNotification
          open={notification.open}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, open: false })}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Requests</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage company creation requests</p>
            </div>
          </div>
          <button 
            onClick={fetchRequests} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {[
              { key: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
              { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'green' },
              { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
              { key: 'all', label: 'All', icon: Building2, color: 'blue' }
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  viewMode === key
                    ? `bg-${color}-600 text-white`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Loading requests...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Requests Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No company requests found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {viewMode === 'pending' ? 'No pending requests at the moment' : `No ${viewMode} requests found`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Requester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {requests.map(request => (
                      <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {request.companyName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              {request.requestedBy}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <Mail className="w-4 h-4 mr-2" />
                              {request.requestedByEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                          {request.processedAt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Processed: {new Date(request.processedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                          {request.status === 'approved' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {request.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => openApprovalModal(request)}
                                  disabled={processingId === request._id}
                                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs flex items-center space-x-1 transition-colors"
                                >
                                  {processingId === request._id ? (
                                    <Loader className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  <span>{processingId === request._id ? 'Processing...' : 'Approve'}</span>
                                </button>
                                <button
                                  onClick={() => openRejectionModal(request)}
                                  disabled={processingId === request._id}
                                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs flex items-center space-x-1 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => openStateChangeModal(request)}
                                disabled={processingId === request._id}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs flex items-center space-x-1 transition-colors"
                              >
                                <Settings className="w-3 h-3" />
                                <span>Change Status</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Approve Company Request
                  </h3>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Company:</strong> {selectedRequest.companyName}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    <strong>Requested by:</strong> {selectedRequest.requestedBy} ({selectedRequest.requestedByEmail})
                  </p>
                </div>
                
                <form onSubmit={handleApprove} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={companyForm.displayName}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        name="logo"
                        value={companyForm.logo}
                        onChange={handleFormChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website URL
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={companyForm.website}
                        onChange={handleFormChange}
                        placeholder="https://company.com"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={companyForm.linkedinUrl}
                        onChange={handleFormChange}
                        placeholder="https://linkedin.com/company/..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={companyForm.industry}
                        onChange={handleFormChange}
                        placeholder="e.g., Technology, Finance"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Size
                      </label>
                      <input
                        type="text"
                        name="size"
                        value={companyForm.size}
                        onChange={handleFormChange}
                        placeholder="e.g., 1-50, 51-200"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aliases
                    </label>
                    <input
                      type="text"
                      name="aliases"
                      value={companyForm.aliases}
                      onChange={handleFormChange}
                      placeholder="Enter aliases separated by commas"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isVerified"
                      name="isVerified"
                      checked={companyForm.isVerified}
                      onChange={handleFormChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="isVerified" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Mark as verified company
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowApprovalModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingId === selectedRequest._id}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {processingId === selectedRequest._id && <Loader className="w-4 h-4 animate-spin" />}
                      <span>{processingId === selectedRequest._id ? 'Creating...' : 'Create Company'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Request</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Company:</strong> {selectedRequest.companyName}
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    <strong>Requested by:</strong> {selectedRequest.requestedBy} ({selectedRequest.requestedByEmail})
                  </p>
                </div>
                
                <form onSubmit={handleReject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for rejecting this request..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRejectionModal(false)}
                      disabled={processingId === selectedRequest._id}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processingId === selectedRequest._id}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {processingId === selectedRequest._id && <Loader className="w-4 h-4 animate-spin" />}
                      <span>{processingId === selectedRequest._id ? 'Rejecting...' : 'Reject Request'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* State Change Modal */}
        {showStateChangeModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Request Status</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update the status of this request</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    <strong>Company:</strong> {selectedRequest.companyName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Requested by:</strong> {selectedRequest.requestedBy} ({selectedRequest.requestedByEmail})
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Status:</span>
                    {selectedRequest.status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                    {selectedRequest.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </span>
                    )}
                    {selectedRequest.status === 'rejected' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </span>
                    )}
                  </div>
                  {selectedRequest.rejectionReason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Previous Reason:</strong> <em>{selectedRequest.rejectionReason}</em>
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Status Change (Optional)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason for the status change..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleStatusChange('pending')}
                      disabled={processingId === selectedRequest._id || selectedRequest.status === 'pending'}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Pending</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange('approved')}
                      disabled={processingId === selectedRequest._id || selectedRequest.status === 'approved'}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-200 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approved</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={processingId === selectedRequest._id || selectedRequest.status === 'rejected'}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rejected</span>
                    </button>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowStateChangeModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanyRequests;
