import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, CURRENCIES } from '../../contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function Settings() {
  const { user, updatePreferredCurrency } = useAuth();
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'USD');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updatePreferredCurrency(currency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getCurrencyDetails = (code) => {
    return CURRENCIES.find(c => c.code === code);
  };

  return (
    <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="text-muted">Manage your account preferences</p>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Card */}
        <motion.div className="card" variants={itemVariants} style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Profile Information</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontWeight: 600
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</div>
              <div className="text-muted">{user?.email}</div>
              <div className="status-badge" style={{ 
                marginTop: '8px',
                background: user?.role === 'admin' ? '#fef3c7' : user?.role === 'manager' ? '#ede9fe' : '#d1fae5',
                color: user?.role === 'admin' ? '#92400e' : user?.role === 'manager' ? '#6d28d9' : '#065f46',
                textTransform: 'capitalize'
              }}>
                {user?.role}
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="input"
                value={user?.firstName || ''}
                disabled
                style={{ background: 'var(--bg-secondary)' }}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="input"
                value={user?.lastName || ''}
                disabled
                style={{ background: 'var(--bg-secondary)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              value={user?.email || ''}
              disabled
              style={{ background: 'var(--bg-secondary)' }}
            />
            <small className="text-muted" style={{ display: 'block', marginTop: '4px' }}>
              Contact your administrator to update your email
            </small>
          </div>
        </motion.div>

        {/* Currency Preferences */}
        <motion.div className="card" variants={itemVariants} style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>Currency Preferences</h3>
          <p className="text-muted" style={{ marginBottom: '20px' }}>
            Choose your preferred currency for displaying expense amounts
          </p>

          <div className="form-group">
            <label>Preferred Currency</label>
            <select
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.name} ({c.code})
                </option>
              ))}
            </select>
            <small className="text-muted" style={{ display: 'block', marginTop: '8px' }}>
              Your expenses will be displayed in this currency on your dashboard. 
              You can still submit expenses in any currency.
            </small>
          </div>

          {/* Currency Preview */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 600
              }}>
                {getCurrencyDetails(currency)?.symbol}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{getCurrencyDetails(currency)?.name}</div>
                <div className="text-muted" style={{ fontSize: '13px' }}>
                  Example: {getCurrencyDetails(currency)?.symbol}1,234.56
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={currency === user?.preferredCurrency}
            >
              Save Changes
            </button>
            {saved && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Saved successfully
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div className="card" variants={itemVariants}>
          <h3 style={{ marginBottom: '8px' }}>Notifications</h3>
          <p className="text-muted" style={{ marginBottom: '20px' }}>
            Manage how you receive updates about your expenses
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'email_approvals', label: 'Email me when an expense is approved or rejected', default: true },
              { id: 'email_reminders', label: 'Send reminders for pending submissions', default: true },
              { id: 'email_updates', label: 'Weekly expense summary digest', default: false },
            ].map(pref => (
              <label key={pref.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <span>{pref.label}</span>
                <div className="toggle">
                  <input type="checkbox" defaultChecked={pref.default} />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Settings;
