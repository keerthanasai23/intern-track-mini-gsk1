import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuthForm({ type }) {
  const [formData, setFormData] = useState(
    type === 'register' 
      ? { 
          role: 'student',
          registerNumber: '',
          name: '',
          email: '',
          password: '',
          batch: '',
          department: ''
        }
      : {
          role: 'student',
          identifier: '',
          password: ''
        }
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      let response;
      
      if (type === 'register') {
        const endpoint = formData.role === 'student' 
          ? '/api/register/student' 
          : '/api/register/coordinator';
        
        const data = formData.role === 'student'
          ? {
              registerNumber: formData.registerNumber,
              name: formData.name,
              email: formData.email,
              password: formData.password,
              batch: formData.batch
            }
          : {
              email: formData.email,
              password: formData.password,
              name: formData.name,
              department: formData.department
            };
        
        response = await axios.post(`http://localhost:5000${endpoint}`, data);
        
        // Store token and redirect
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', formData.role);
        
        if (formData.role === 'student') {
          navigate('/internship-form');
        } else {
          navigate('/coordinator-dashboard');
        }
      } else {
        const endpoint = formData.role === 'student'
          ? '/api/login/student'
          : '/api/login/coordinator';
        
        const data = formData.role === 'student'
          ? {
              registerNumber: formData.identifier,
              password: formData.password
            }
          : {
              email: formData.identifier,
              password: formData.password
            };
        
        response = await axios.post(`http://localhost:5000${endpoint}`, data);
        
        // Store token and redirect
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', formData.role);
        
        if (formData.role === 'student') {
          navigate('/edit-details');
        } else {
          navigate('/coordinator-dashboard');
        }
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>{type === 'register' ? 'Register' : 'Login'}</h2>
      
      {errors.submit && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Role*
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="student">Student</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </label>
        </div>

        {type === 'register' ? (
          <>
            {formData.role === 'student' ? (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Register Number*
                    <input
                      type="text"
                      name="registerNumber"
                      value={formData.registerNumber}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                      pattern="[A-Z0-9]{5,20}"
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Name*
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Email*
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Password* (min 6 characters)
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Batch*
                    <input
                      type="text"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Name*
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Email*
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Password* (min 6 characters)
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>
                    Department*
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </label>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>
                {formData.role === 'student' ? 'Register Number' : 'Email'}*
                <input
                  type={formData.role === 'student' ? 'text' : 'email'}
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px' }}
                  pattern={formData.role === 'student' ? '[A-Z0-9]{5,20}' : undefined}
                />
              </label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>
                Password*
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </label>
            </div>
          </>
        )}

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
          {isSubmitting ? 'Processing...' : type === 'register' ? 'Register' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '15px' }}>
        {type === 'register' ? (
          <p>Already have an account? <a href="/login">Login here</a></p>
        ) : (
          <p>Don't have an account? <a href="/register">Register here</a></p>
        )}
      </div>
    </div>
  );
}