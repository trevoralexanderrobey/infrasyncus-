import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email, password }
        : { email, password, name };
      
      const { data } = await axios.post(endpoint, payload);
      
      // Store both user data and token
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        token: data.token
      }));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div className="error">{error}</div>}
      {isLoading && <div className="loading">Loading...</div>}
      <form onSubmit={handleSubmit} className={isLoading ? 'disabled' : ''}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <button 
        className="toggle-mode" 
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Need to create an account?' : 'Already have an account?'}
      </button>
    </div>
  );
};