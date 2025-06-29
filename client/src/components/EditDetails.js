import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditDetails = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registerNumber: '',
    batch: ''
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/student/details', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setFormData(res.data);
      } catch (err) {
        console.error('Error fetching details:', err);
        setError(err.response?.data?.error || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDetails();
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, [token]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
  
    try {
      const res = await axios.put(
        'http://localhost:5000/api/student/details',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // Set a timeout
        }
      );
      setMessage('Details updated successfully!');
    } catch (err) {
      let errorMessage = 'Failed to update details';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server not responding';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server - make sure backend is running';
      } else if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      'Failed to update details';
      }
      
      console.error('Update error:', err);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading details...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Edit Your Details</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label><br />
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Register Number:</label><br />
          <input name="registerNumber" value={formData.registerNumber} disabled />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Batch:</label><br />
          <input name="batch" value={formData.batch} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Details'}
        </button>
      </form>
    </div>
  );
};

export default EditDetails;
