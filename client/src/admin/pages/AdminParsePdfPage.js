import React, { useState } from 'react';

import axios from 'axios';
import { createApiUrl } from '../../config/api';
import CompanySearch from '../../components/CompanySearch';

const AdminParsePdfPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !company?._id) {
      setError('Please select a company and upload a PDF.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('companyId', company._id);
      formData.append('companyName', company.displayName);
      const res = await axios.post(
        createApiUrl('/api/admin/parse-pdf'),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error parsing PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <h2>Admin: Parse Interview PDF</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Select Company:</label>
          <CompanySearch
            value={company?.displayName || ''}
            onChange={() => {}}
            onCompanySelect={setCompany}
            className="psg-create-input"
            placeholder="Search company..."
            required
          />
        </div>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <button type="submit" disabled={!file || !company || loading} style={{ marginLeft: 12 }}>
          {loading ? 'Parsing...' : 'Parse PDF'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {result && (
        <>
          <pre style={{ marginTop: 24, background: '#f6f8fa', padding: 16, borderRadius: 4, maxHeight: 400, overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          <button
            style={{ marginTop: 16, padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            onClick={() => {
                const encoded = encodeURIComponent(
                    window.btoa(unescape(encodeURIComponent(JSON.stringify(result))))
                );
                window.open(`/create?prefill=${encoded}`, '_blank');
            }}
          >
            Create Experience from Parsed Data
          </button>
        </>
      )}
    </div>
  );
};

export default AdminParsePdfPage;
