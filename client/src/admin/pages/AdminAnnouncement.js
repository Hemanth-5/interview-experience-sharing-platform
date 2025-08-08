import React, { useState } from 'react';
import axios from 'axios';
import { createApiUrl } from '../../config/api';
import './AdminAnnouncement.css';

const AdminAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      // Send an admin_message notification to all users
      await axios.post(createApiUrl('/api/admin/announce'), {
        title,
        message
      }, { withCredentials: true });
      setSuccess('Announcement sent to all users!');
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-announcement-page">
      <h2>Send Announcement / News</h2>
      <form onSubmit={handleSubmit} className="announcement-form">
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </label>
        <label>
          Message
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={8}
            placeholder="Write your announcement here. You can use line breaks for formatting."
            style={{ minHeight: 120 }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Announcement'}
        </button>
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}
      </form>
    </div>
  );
};

export default AdminAnnouncement;
