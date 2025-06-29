import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InternshipForm() {
  const [formData, setFormData] = useState({
    batch: '',
    registerNumber: '',
    name: '',
    email: '',
    mobileNumber: '',
    companyName: '',
    duration: '',
    stipend: '',
    obtainedThroughCDC: false,
    internshipAbroad: false
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.role === 'student') {
      setFormData(prev => ({
        ...prev,
        registerNumber: userData.registerNumber || '',
        name: userData.name || '',
        email: userData.email || '',
        batch: userData.batch || ''
      }));
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.batch.trim()) newErrors.batch = 'Batch is required';
    if (!formData.registerNumber.trim()) newErrors.registerNumber = 'Register number is required';
    if (!/^[A-Z0-9]{5,20}$/.test(formData.registerNumber)) {
      newErrors.registerNumber = 'Invalid register number format';
    }
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Invalid mobile number';
    }
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!file) newErrors.file = 'Document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitStatus({
        success: false,
        message: 'Authentication required. Please login again.'
      });
      setIsSubmitting(false);
      return;
    }
    
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    
    if (file) data.append('document', file);

    try {
      const response = await axios.post('http://localhost:5000/api/internships', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSubmitStatus({
        success: true,
        message: 'Thank you for submitting your internship details!',
        documentPath: response.data.documentPath
      });
      
      setFormData({
        ...formData,
        companyName: '',
        duration: '',
        stipend: '',
        obtainedThroughCDC: false,
        internshipAbroad: false
      });
      setFile(null);
      
    } catch (error) {
      let errorMessage = error.message;
      
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          errorMessage = 'Session expired. Please login again.';
        } else {
          errorMessage = error.response.data?.error || errorMessage;
        }
      }
      
      setSubmitStatus({
        success: false,
        message: errorMessage
      });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Add Internship Details</h2>

      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => {
          if (key === 'obtainedThroughCDC' || key === 'internshipAbroad') return null;
          
          return (
            <div key={key} style={{ marginBottom: '15px' }}>
              <label>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}*
                {errors[key] && (
                  <span style={{ color: 'red', fontSize: '0.8em', marginLeft: '10px' }}>
                    {errors[key]}
                  </span>
                )}
              </label>
              <input
                type={key === 'email' ? 'email' : 
                      key === 'mobileNumber' ? 'tel' : 
                      key === 'stipend' ? 'number' : 'text'}
                name={key}
                value={value}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: errors[key] ? '1px solid red' : '1px solid #ddd',
                  backgroundColor: 'white'
                }}
                pattern={
                  key === 'mobileNumber' ? '[0-9]{10}' : 
                  key === 'registerNumber' ? '[A-Z0-9]{5,20}' : undefined
                }
              />
            </div>
          );
        })}

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              name="obtainedThroughCDC"
              checked={formData.obtainedThroughCDC}
              onChange={handleChange}
            />
            Obtained through CDC
          </label>
          <label style={{ marginLeft: '15px' }}>
            <input
              type="checkbox"
              name="internshipAbroad"
              checked={formData.internshipAbroad}
              onChange={handleChange}
            />
            Internship Abroad
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Upload Document*
            {errors.file && (
              <span style={{ color: 'red', fontSize: '0.8em', marginLeft: '10px' }}>
                {errors.file}
              </span>
            )}
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              border: errors.file ? '1px solid red' : '1px solid #ddd'
            }}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {file && (
            <div style={{ marginTop: '5px', fontSize: '0.8em' }}>
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 15px',
            background: isSubmitting ? '#cccccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>

        {/* Moved the status message to appear after the submit button */}
        {submitStatus && (
          <div style={{
            padding: '10px',
            margin: '20px 0 10px 0',
            backgroundColor: submitStatus.success ? '#d4edda' : '#f8d7da',
            color: submitStatus.success ? '#155724' : '#721c24',
            border: `1px solid ${submitStatus.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            {submitStatus.message}
            {submitStatus.documentPath && (
              <div style={{ marginTop: '5px' }}>
                <small>Document path: {submitStatus.documentPath}</small>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}