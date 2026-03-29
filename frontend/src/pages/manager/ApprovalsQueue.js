import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, CURRENCIES } from '../../contexts/AuthContext';

const demoApprovals = [
  {
    id: '1',
    employeeId: '3',
    employeeName: 'Emma Employee',
    employeeEmail: 'emma@techcorp.com',
    category: 'Travel',
    description: 'Flight to NYC for client meeting',
    amountSubmitted: 150.00,
    currencySubmitted: 'GBP',
    amountManager: 190.50, // Converted to manager's preferred (EUR)
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=400',
    submittedAt: '2024-03-28T10:30:00',
    currentStep: 1,
    totalSteps: 2,
    flowName: 'Standard Travel Flow'
  },
  {
    id: '2',
    employeeId: '4',
    employeeName: 'James Wilson',
    employeeEmail: 'james@techcorp.com',
    category: 'IT Equipment',
    description: 'Ergonomic keyboard and mouse for WFH setup',
    amountSubmitted: 250.00,
    currencySubmitted: 'USD',
    amountManager: 228.75,
    receiptUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    submittedAt: '2024-03-27T14:15:00',
    currentStep: 1,
    totalSteps: 1,
    flowName: 'Equipment Flow'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Emma Employee',
    employeeEmail: 'emma@techcorp.com',
    category: 'Food',
    description: 'Team lunch - quarterly planning session',
    amountSubmitted: 5000,
    currencySubmitted: 'JPY',
    amountManager: 30.50,
    receiptUrl: null,
    submittedAt: '2024-03-28T16:45:00',
    currentStep: 1,
    totalSteps: 1,
    flowName: 'Quick Approval'
  },
];

const formatCurrency = (amount, currency) => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹' };
  const symbol = symbols[currency] || currency + ' ';
  const decimals = currency === 'JPY' ? 0 : 2;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function ApprovalsQueue() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState(demoApprovals);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('all');

  const managerCurrency = user?.preferredCurrency || 'EUR';
  const managerSymbol = CURRENCIES.find(c => c.code === managerCurrency)?.symbol || '€';

  const filteredApprovals = filter === 'all' 
    ? approvals 
    : approvals.filter(a => a.category.toLowerCase() === filter);

  const handleApprove = () => {
    if (!comment.trim()) {
      alert('Please add a comment');
      return;
    }
    setApprovals(approvals.filter(a => a.id !== selectedApproval.id));
    setShowReviewModal(false);
    setSelectedApproval(null);
    setComment('');
  };

  const handleReject = () => {
    if (!comment.trim()) {
      alert('Please add a comment explaining the rejection');
      return;
    }
    setApprovals(approvals.filter(a => a.id !== selectedApproval.id));
    setShowReviewModal(false);
    setSelectedApproval(null);
    setComment('');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Travel':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
      case 'IT Equipment':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
      case 'Food':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
      default:
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  const categories = [...new Set(approvals.map(a => a.category))];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Approvals for Review</h1>
          <p className="text-muted">
            {approvals.length} expense{approvals.length !== 1 ? 's' : ''} awaiting your decision
          </p>
        </div>
      </header>

      {/* Quick Stats */}
      <motion.div 
        className="stats-grid"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{approvals.length}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {managerSymbol}{approvals.reduce((sum, a) => sum + a.amountManager, 0).toFixed(2)}
            </div>
            <div className="stat-label">Total Value ({managerCurrency})</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{new Set(approvals.map(a => a.employeeId)).size}</div>
            <div className="stat-label">Team Members</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({approvals.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab ${filter === cat.toLowerCase() ? 'active' : ''}`}
            onClick={() => setFilter(cat.toLowerCase())}
          >
            {cat} ({approvals.filter(a => a.category === cat).length})
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <motion.div 
        className="approvals-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredApprovals.map(approval => (
            <motion.div
              key={approval.id}
              className="card approval-card"
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedApproval(approval);
                setShowReviewModal(true);
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {approval.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{approval.employeeName}</div>
                    <div className="text-muted" style={{ fontSize: '13px' }}>{formatDate(approval.submittedAt)}</div>
                  </div>
                </div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  {getCategoryIcon(approval.category)}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <div className="text-muted" style={{ fontSize: '12px', marginBottom: '4px' }}>{approval.category}</div>
                <div style={{ fontWeight: 500 }}>{approval.description}</div>
              </div>

              {/* Dual Currency Display */}
              <div style={{ 
                background: 'var(--bg-secondary)', 
                borderRadius: '10px', 
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div className="text-muted" style={{ fontSize: '11px', marginBottom: '2px' }}>SUBMITTED</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                      {formatCurrency(approval.amountSubmitted, approval.currencySubmitted)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-muted" style={{ fontSize: '11px', marginBottom: '2px' }}>YOUR VIEW ({managerCurrency})</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                      {formatCurrency(approval.amountManager, managerCurrency)}
                    </div>
                  </div>
                </div>
                {approval.currencySubmitted !== managerCurrency && (
                  <div className="text-muted" style={{ fontSize: '11px', textAlign: 'center' }}>
                    Live converted for your review
                  </div>
                )}
              </div>

              {/* Workflow Progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '80px',
                    height: '4px',
                    background: 'var(--border)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(approval.currentStep / approval.totalSteps) * 100}%`,
                      height: '100%',
                      background: 'var(--primary)'
                    }}/>
                  </div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    Step {approval.currentStep}/{approval.totalSteps}
                  </span>
                </div>
                <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                  Needs Review
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredApprovals.length === 0 && (
        <motion.div 
          className="card empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3 style={{ marginTop: '16px' }}>All caught up!</h3>
          <p className="text-muted">No expenses pending your review</p>
        </motion.div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedApproval && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div 
              className="modal"
              style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Review Expense</h2>
                <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
              </div>

              <div className="modal-body">
                {/* Two Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedApproval.receiptUrl ? '1fr 1fr' : '1fr', gap: '24px' }}>
                  {/* Left: Expense Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600
                      }}>
                        {selectedApproval.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedApproval.employeeName}</div>
                        <div className="text-muted" style={{ fontSize: '13px' }}>{selectedApproval.employeeEmail}</div>
                      </div>
                    </div>

                    <div className="detail-row" style={{ marginBottom: '16px' }}>
                      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Category</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getCategoryIcon(selectedApproval.category)}
                        <span style={{ fontWeight: 500 }}>{selectedApproval.category}</span>
                      </div>
                    </div>

                    <div className="detail-row" style={{ marginBottom: '16px' }}>
                      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Description</div>
                      <div>{selectedApproval.description}</div>
                    </div>

                    <div className="detail-row" style={{ marginBottom: '16px' }}>
                      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Submitted</div>
                      <div>{new Date(selectedApproval.submittedAt).toLocaleString()}</div>
                    </div>

                    {/* Currency Box */}
                    <div style={{ 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '12px', 
                      padding: '20px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div className="text-muted" style={{ fontSize: '12px', marginBottom: '4px' }}>
                            Submitted Amount
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                            {formatCurrency(selectedApproval.amountSubmitted, selectedApproval.currencySubmitted)}
                          </div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>
                            Original receipt currency
                          </div>
                        </div>
                        <div>
                          <div className="text-muted" style={{ fontSize: '12px', marginBottom: '4px' }}>
                            Your View ({managerCurrency})
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                            {formatCurrency(selectedApproval.amountManager, managerCurrency)}
                          </div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>
                            Converted for your review
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Workflow</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{selectedApproval.flowName}</span>
                        <span className="text-muted">•</span>
                        <span className="text-muted">Step {selectedApproval.currentStep} of {selectedApproval.totalSteps}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Receipt */}
                  {selectedApproval.receiptUrl && (
                    <div>
                      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>Receipt</div>
                      <img 
                        src={selectedApproval.receiptUrl} 
                        alt="Receipt" 
                        style={{ 
                          width: '100%', 
                          borderRadius: '12px',
                          border: '1px solid var(--border)'
                        }} 
                      />
                    </div>
                  )}
                </div>

                {/* Comment Section */}
                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label>Comment (Required)</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment for your decision..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn"
                  style={{ background: 'var(--error)', color: 'white' }}
                  onClick={handleReject}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Reject
                </button>
                <button 
                  className="btn"
                  style={{ background: 'var(--success)', color: 'white' }}
                  onClick={handleApprove}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ApprovalsQueue;
