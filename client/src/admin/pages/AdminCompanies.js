import React, { useEffect, useState } from 'react';
import { createApiUrl } from '../../config/api';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import '../styles/AdminCompanies.css';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
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
        ? createApiUrl(`/api/admin/companies/${editingCompany._id}`)
        : createApiUrl('/api/admin/companies');
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
    } catch {
      setError('Failed to save company');
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
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    setDeletingId(id);
    try {
      const response = await fetchWithAdminAuth(`/api/admin/companies/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setCompanies(prev => prev.filter(c => c._id !== id));
    } catch {
      alert('Failed to delete company');
    }
    setDeletingId(null);
  };

  useEffect(() => { fetchCompanies(); }, []);

  return (
    <div className="admin-companies-container">
      <div className="admin-companies-header">
        <h2>Companies</h2>
        <button className="admin-companies-btn admin-companies-btn-primary" onClick={() => openModal()}>+ Add Company</button>
      </div>

      {/* Filters */}
      <div className="admin-companies-filters">
        <input className="admin-companies-input" placeholder="Search..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        <select className="admin-companies-select" value={filter.industry} onChange={e => setFilter(f => ({ ...f, industry: e.target.value }))}>
          <option value="">All Industries</option>
          {industries.map(ind => <option key={ind}>{ind}</option>)}
        </select>
        <select className="admin-companies-select" value={filter.size} onChange={e => setFilter(f => ({ ...f, size: e.target.value }))}>
          <option value="">All Sizes</option>
          {sizes.map(sz => <option key={sz}>{sz}</option>)}
        </select>
        <select className="admin-companies-select" value={filter.isVerified} onChange={e => setFilter(f => ({ ...f, isVerified: e.target.value }))}>
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {loading ? <div className="admin-companies-loading">Loading...</div> : error ? <div className="admin-companies-error">{error}</div> : (
        <div className="admin-companies-table-wrapper">
          <table className="admin-companies-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Website</th>
                <th>Industry</th>
                <th>Size</th>
                <th>LinkedIn</th>
                <th>Verified</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length ? filteredCompanies.map(c => (
                <tr key={c._id}>
                  <td><img src={c.logo} alt={c.displayName} className="admin-companies-logo" style={{ width: 50, height: 50, objectFit: 'cover' }} /></td>
                  <td>{c.displayName}</td>
                  <td>{c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="admin-companies-link">Website</a> : <span className="admin-companies-na">N/A</span>}</td>
                  <td>{c.industry || <span className="admin-companies-na">N/A</span>}</td>
                  <td>{c.size || <span className="admin-companies-na">N/A</span>}</td>
                  <td>{c.linkedinUrl ? <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="admin-companies-link">LinkedIn</a> : <span className="admin-companies-na">N/A</span>}</td>
                  <td>{c.isVerified ? <span className="admin-companies-verified">✔</span> : <span className="admin-companies-unverified">✖</span>}</td>
                  <td>
                    <button className="admin-companies-btn admin-companies-btn-small" onClick={() => openModal(c)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="admin-companies-btn admin-companies-btn-danger admin-companies-btn-small" onClick={() => handleDelete(c._id)}>
                      {deletingId === c._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="7" className="admin-companies-empty">No companies found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-companies-modal-overlay" onClick={closeModal}>
          <div className="admin-companies-modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingCompany ? 'Edit Company' : 'Add Company'}</h3>
            <form onSubmit={handleFormSubmit} className="admin-companies-modal-form">
              <input name="displayName" placeholder="Display Name*" value={form.displayName} onChange={handleFormChange} required />
              <input name="logo" placeholder="Logo URL" value={form.logo} onChange={handleFormChange} />
              <input name="website" placeholder="Website" value={form.website} onChange={handleFormChange} />
              <input name="linkedinUrl" placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={handleFormChange} />
              <input name="industry" placeholder="Industry" value={form.industry} onChange={handleFormChange} />
              <input name="size" placeholder="Size" value={form.size} onChange={handleFormChange} />
              <input name="aliases" placeholder="Aliases (comma separated)" value={form.aliases} onChange={handleFormChange} />
              <label className="admin-companies-checkbox-label">
                <input type="checkbox" name="isVerified" checked={form.isVerified} onChange={handleFormChange} /> Verified
              </label>
              <div className="admin-companies-modal-actions">
                <button type="submit" className="admin-companies-btn admin-companies-btn-primary" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</button>
                <button type="button" className="admin-companies-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
