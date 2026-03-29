import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const demoAccounts = [
  { email: 'admin@techcorp.com', role: 'Admin', description: 'Full system access' },
  { email: 'manager@techcorp.com', role: 'Manager', description: 'Approve team expenses' },
  { email: 'employee@techcorp.com', role: 'Employee', description: 'Submit expenses' },
];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      // Navigate based on role
      if (email.includes('admin')) {
        navigate('/admin/team');
      } else if (email.includes('manager')) {
        navigate('/approvals');
      } else {
        navigate('/my-expenses');
      }
    } else {
      setError('Invalid credentials. Use demo123 as password.');
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div 
          style={{ textAlign: 'center', marginBottom: '32px' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ 
            width: '56px', 
            height: '56px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
          }}>
            💎
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your expense dashboard</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ 
              background: 'var(--error-light)', 
              color: 'var(--error)', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company.com"
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px',
            fontSize: '13px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              color: 'var(--text-tertiary)'
            }}>
              <input type="checkbox" style={{ 
                width: '16px', 
                height: '16px',
                accentColor: 'var(--primary)'
              }} />
              Remember me
            </label>
            <button type="button" style={{ 
              color: 'var(--primary)', 
              fontWeight: '500', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: 0
            }}>
              Forgot password?
            </button>
          </div>

          <motion.button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px 24px', fontSize: '15px' }}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <motion.svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </motion.svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </motion.button>
        </form>

        {/* Demo Accounts */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            Quick login with demo accounts:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoAccounts.map(account => (
              <motion.button
                key={account.email}
                type="button"
                onClick={() => handleDemoLogin(account.email)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  padding: '12px 16px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {account.role}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {account.description}
                  </div>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  color: 'var(--primary)',
                  background: 'var(--primary-50)',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  Try it
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
