import React, { useEffect, useState } from 'react';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import PSGNotification from '../../components/PSGNotification';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Globe,
  Users,
  Loader,
  X
} from 'lucide-react';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [form, setForm] = useState({
    displayName: '',
    logo: '',
    website: '',
    linkedinUrl: '',
    industry: '',
    size: '',
    aliases: '',
    isVerified: false
  });
  const [formLoading, setFormLoading] = useState(false);

  const [filter, setFilter] = useState({
    search: '',
    industry: '',
    size: '',
    isVerified: '',
    hasLogo: '',
    hasLinkedIn: '',
    alias: ''
  });

  const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)));
  const sizes = Array.from(new Set(companies.map(c => c.size).filter(Boolean)));
  const aliases = Array.from(new Set(companies.flatMap(c => c.aliases || [])));

  const filteredCompanies = companies.filter(company => {
    const search = filter.search.trim().toLowerCase();
    if (search && !(
      (company.displayName || '').toLowerCase().includes(search) ||
      (company.website || '').toLowerCase().includes(search) ||
      (company.linkedinUrl || '').toLowerCase().includes(search) ||
      (company.aliases || []).some(a => a.toLowerCase().includes(search))
    )) return false;
    if (filter.industry && company.industry !== filter.industry) return false;
    if (filter.size && company.size !== filter.size) return false;
    if (filter.isVerified && String(company.isVerified) !== filter.isVerified) return false;
    if (filter.hasLogo && ((filter.hasLogo === 'yes' && !company.logo) || (filter.hasLogo === 'no' && company.logo))) return false;
    if (filter.hasLinkedIn && ((filter.hasLinkedIn === 'yes' && !company.linkedinUrl) || (filter.hasLinkedIn === 'no' && company.linkedinUrl))) return false;
    if (filter.alias && !(company.aliases || []).includes(filter.alias)) return false;
    return true;
  });

  const openModal = (company = null) => {
    setEditingCompany(company);
    if (company) {
      setForm({
        displayName: company.displayName || '',
        logo: company.logo || '',
        website: company.website || '',
        linkedinUrl: company.linkedinUrl || '',
        industry: company.industry || '',
        size: company.size || '',
        aliases: (company.aliases || []).join(', '),
        isVerified: company.isVerified || false
      });
    } else {
      setForm({
        displayName: '',
        logo: '',
        website: '',
        linkedinUrl: '',
        industry: '',
        size: '',
        aliases: '',
        isVerified: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCompany(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const method = editingCompany ? 'PUT' : 'POST';
      const url = editingCompany
        ? `/api/admin/companies/${editingCompany._id}`
        : '/api/admin/companies';
      const body = {
        ...form,
        aliases: form.aliases.split(',').map(a => a.trim()).filter(Boolean)
      };
      const response = await fetchWithAdminAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error();
      await fetchCompanies();
      closeModal();
      setNotification({ 
        open: true, 
        message: editingCompany ? 'Company updated successfully!' : 'Company created successfully!', 
        type: 'success' 
      });
    } catch {
      setError('Failed to save company');
      setNotification({ 
        open: true, 
        message: editingCompany ? 'Failed to update company' : 'Failed to create company', 
        type: 'error' 
      });
    }
    setFormLoading(false);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAdminAuth('/api/admin/companies');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCompanies(data);
    } catch {
      setError('Failed to fetch companies');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetchWithAdminAuth(`/api/admin/companies/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setCompanies(prev => prev.filter(c => c._id !== id));
      setShowDeleteModal(false);
      setDeletingCompany(null);
      setNotification({ 
        open: true, 
        message: 'Company deleted successfully!', 
        type: 'success' 
      });
    } catch {
      setError('Failed to delete company');
      setNotification({ 
        open: true, 
        message: 'Failed to delete company', 
        type: 'error' 
      });
    }
    setDeletingId(null);
  };

  const openDeleteModal = (company) => {
    setDeletingCompany(company);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingCompany(null);
  };

  useEffect(() => { fetchCompanies(); }, []);

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage and organize company information</p>
            </div>
          </div>
          <button 
            onClick={() => openModal()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{companies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter(c => c.isVerified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Websites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.filter(c => c.website).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Industries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{industries.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filter.industry}
              onChange={e => setFilter(f => ({ ...f, industry: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            
            <select
              value={filter.size}
              onChange={e => setFilter(f => ({ ...f, size: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sizes</option>
              {sizes.map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
            
            <select
              value={filter.isVerified}
              onChange={e => setFilter(f => ({ ...f, isVerified: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Loading companies...</span>
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

        {/* Companies Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Links</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCompanies.length ? (
                    filteredCompanies.map(company => (
                      <tr key={company._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.displayName} 
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {company.displayName}
                            </div>
                            {company.aliases && company.aliases.length > 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Aliases: {company.aliases.join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {company.industry || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {company.size || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                Website
                              </a>
                            )}
                            {company.linkedinUrl && (
                              <a
                                href={company.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {company.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              <XCircle className="w-3 h-3 mr-1" />
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal(company)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs flex items-center space-x-1 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(company)}
                              disabled={deletingId === company._id}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs flex items-center space-x-1 transition-colors"
                            >
                              {deletingId === company._id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>{deletingId === company._id ? 'Deleting...' : 'Delete'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Building2 className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No companies found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Try adjusting your filters or add a new company
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingCompany ? 'Edit Company' : 'Add New Company'}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={form.displayName}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter company name"
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
                      value={form.logo}
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
                      value={form.website}
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
                      value={form.linkedinUrl}
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
                      value={form.industry}
                      onChange={handleFormChange}
                      placeholder="e.g., Technology, Finance, Healthcare"
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
                      value={form.size}
                      onChange={handleFormChange}
                      placeholder="e.g., 1-50, 51-200, 201-1000, 1000+"
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
                    value={form.aliases}
                    onChange={handleFormChange}
                    placeholder="Enter aliases separated by commas (e.g., Corp, Inc, Ltd)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Alternative names or abbreviations for this company
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isVerified"
                    name="isVerified"
                    checked={form.isVerified}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="isVerified" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mark as verified company
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {formLoading && <Loader className="w-4 h-4 animate-spin" />}
                    <span>{formLoading ? 'Saving...' : (editingCompany ? 'Update Company' : 'Create Company')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingCompany && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Company</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Are you sure you want to delete <strong>{deletingCompany.displayName}</strong>? 
                    This will permanently remove the company and all associated data.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deletingId === deletingCompany._id}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deletingCompany._id)}
                    disabled={deletingId === deletingCompany._id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {deletingId === deletingCompany._id && <Loader className="w-4 h-4 animate-spin" />}
                    <span>{deletingId === deletingCompany._id ? 'Deleting...' : 'Delete Company'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanies;
