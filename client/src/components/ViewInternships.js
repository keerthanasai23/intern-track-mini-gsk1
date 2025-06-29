import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ViewInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/internships');
        setInternships(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>All Internships</h2>
      <button onClick={() => navigate('/')}>Add New Internship</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Company</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Document</th>
          </tr>
        </thead>
        <tbody>
          {internships.map(internship => (
            <tr key={internship._id} style={{ border: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {internship.name} ({internship.registerNumber})
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {internship.companyName}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {internship.documentPath && (
                  <a 
                    href={`http://localhost:5000/documents/${internship.documentPath}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', textDecoration: 'none' }}
                  >
                    View Document
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}