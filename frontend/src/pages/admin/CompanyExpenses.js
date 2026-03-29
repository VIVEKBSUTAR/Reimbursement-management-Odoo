import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const demoExpenses = [
  { 
    id: '1', 
    employeeId: '3',
    employeeName: 'Emma Employee',
    category: 'Travel',
    description: 'Client meeting in NYC',
    amountSubmitted: 1250.00,
    currencySubmitted: 'USD',
    amountBase: 1250.00,
    status: 'pending',
    currentStep: 1,
    totalSteps: 2,
    submittedAt: '2024-03-28T10:30:00',
    flowName: 'Standard Travel Flow'
  },
  { 
    id: '2', 
    employeeId: '4',
    employeeName: 'James Wilson',
    category: 'IT Equipment',
    description: 'MacBook Pro for development',
    amountSubmitted: 2499.00,
    currencySubmitted: 'USD',
    amountBase: 2499.00,
    status: 'approved',
    currentStep: 2,
    totalSteps: 2,
    submittedAt: '2024-03-27T14:15:00',
    flowName: 'High Value Equipment'
  },
  { 
    id: '3', 
    employeeId: '3',
    employeeName: 'Emma Employee',
    category: 'Food',
    description: 'Team lunch meeting',
    amountSubmitted: 150.00,
    currencySubmitted: 'GBP',
    amountBase: 190.50,
    status: 'pending',
    currentStep: 1,
    totalSteps: 1,
    submittedAt: '2024-03-28T16:45:00',
    flowName: 'Standard Approval'
  },
  { 
    id: '4', 
    employeeId: '5',
    employeeName: 'Sarah Chen',
    category: 'Travel',
    description: 'Conference in Tokyo',
    amountSubmitted: 450000,
    currencySubmitted: 'JPY',
    amountBase: 3000.00,
    status: 'rejected',
    currentStep: 1,
    totalSteps: 2,
    submittedAt: '2024-03-26T09:00:00',
    flowName: 'Standard Travel Flow'
  },
  { 
    id: '5', 
    employeeId: '4',
    employeeName: 'James Wilson',
    category: 'Office Supplies',
    description: 'Ergonomic keyboard and mouse',
    amountSubmitted: 250.00,
    currencySubmitted: 'USD',
    amountBase: 250.00,
    status: 'approved',
    currentStep: 1,
    totalSteps: 1,
    submittedAt: '2024-03-25T11:30:00',
    flowName: 'Office Supplies'
  },
];

const formatCurrency = (amount, currency) => {
  const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: currency === 'JPY' ? 0 : 2 })}`;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function CompanyExpenses() {
  const { company } = useAuth();
  const [expenses, setExpenses] = useState(demoExpenses);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideComment, setOverrideComment] = useState('');

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      exp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amountBase, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const approvedCount = expenses.filter(e => e.status === 'approved').length;
  const rejectedCount = expenses.filter(e => e.status === 'rejected').length;

  const handleOverride = (action) => {
    setExpenses(expenses.map(exp => 
      exp.id === selectedExpense.id 
        ? { ...exp, status: action === 'approve' ? 'approved' : 'rejected' }
        : exp
    ));
    setShowOverrideModal(false);
    setSelectedExpense(null);
    setOverrideComment('');
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      approved: { bg: '#d1fae5', color: '#065f46', label: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
      draft: { bg: '#e5e7eb', color: '#374151', label: 'Draft' }
    };
    const config = configs[status] || configs.pending;
    return <span className="status-badge" style={{ background: config.bg, color: config.color }}>{config.label}</span>;
  };

  const categories = [...new Set(expenses.map(e => e.category))];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Company Expenses</h1>
          <p className="text-muted">Global oversight of all expenses • Displayed in {company?.baseCurrency || 'USD'}</p>
        </div>
        <button className="btn btn-ghost">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Report
        </button>
      </header>

      {/* Summary Stats */}
      <motion.div 
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalAmount, company?.baseCurrency || 'USD')}</div>
            <div className="stat-label">Total ({company?.baseCurrency || 'USD'})</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-label">Approved</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#991b1b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{rejectedCount}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by employee or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
            style={{ width: 'auto' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
            style={{ width: 'auto' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <motion.div 
        className="card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Description</th>
              <th>Category</th>
              <th>Submitted</th>
              <th style={{ textAlign: 'right' }}>Amount ({company?.baseCurrency || 'USD'})</th>
              <th>Workflow</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <motion.tr 
                key={expense.id}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <td>
                  <div style={{ fontWeight: 500 }}>{expense.employeeName}</div>
                </td>
                <td>
                  <div className="text-truncate" style={{ maxWidth: '200px' }}>
                    {expense.description}
                  </div>
                </td>
                <td className="text-muted">{expense.category}</td>
                <td className="text-muted">{formatDate(expense.submittedAt)}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontWeight: 600 }}>
                    {formatCurrency(expense.amountBase, company?.baseCurrency || 'USD')}
                  </div>
                  {expense.currencySubmitted !== (company?.baseCurrency || 'USD') && (
                    <div className="text-muted" style={{ fontSize: '12px' }}>
                      ({formatCurrency(expense.amountSubmitted, expense.currencySubmitted)})
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '60px',
                      height: '6px',
                      background: 'var(--border)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(expense.currentStep / expense.totalSteps) * 100}%`,
                        height: '100%',
                        background: expense.status === 'approved' ? 'var(--success)' : 
                                   expense.status === 'rejected' ? 'var(--error)' : 'var(--primary)',
                        transition: 'width 0.3s ease'
                      }}/>
                    </div>
                    <span className="text-muted" style={{ fontSize: '12px' }}>
                      {expense.currentStep}/{expense.totalSteps}
                    </span>
                  </div>
                </td>
                <td>{getStatusBadge(expense.status)}</td>
                <td>
                  {expense.status === 'pending' && (
                    <button 
                      className="btn btn-ghost"
                      style={{ padding: '6px 12px', color: 'var(--warning)' }}
                      onClick={() => {
                        setSelectedExpense(expense);
                        setShowOverrideModal(true);
                      }}
                    >
                      Override
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredExpenses.length === 0 && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M9 17H7A5 5 0 017 7h2m6 10h2a5 5 0 000-10h-2m-8 5h12"/>
            </svg>
            <h3>No expenses found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </motion.div>

      {/* Override Modal */}
      <AnimatePresence>
        {showOverrideModal && selectedExpense && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOverrideModal(false)}
          >
            <motion.div 
              className="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Admin Override</h2>
                <button className="modal-close" onClick={() => setShowOverrideModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '4px' }}>
                      Warning: Admin Override
                    </div>
                    <div style={{ color: '#b45309', fontSize: '14px' }}>
                      This action will bypass the normal approval workflow. This is logged for audit purposes.
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ marginBottom: '12px' }}>Expense Details</h4>
                  <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div className="text-muted" style={{ fontSize: '13px' }}>Employee</div>
                      <div style={{ fontWeight: 500 }}>{selectedExpense.employeeName}</div>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '13px' }}>Amount</div>
                      <div style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(selectedExpense.amountBase, company?.baseCurrency || 'USD')}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div className="text-muted" style={{ fontSize: '13px' }}>Description</div>
                      <div>{selectedExpense.description}</div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Override Reason (Required)</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={overrideComment}
                    onChange={(e) => setOverrideComment(e.target.value)}
                    placeholder="Explain the reason for this override..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowOverrideModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn"
                  style={{ background: 'var(--error)', color: 'white' }}
                  onClick={() => handleOverride('reject')}
                  disabled={!overrideComment.trim()}
                >
                  Force Reject
                </button>
                <button 
                  className="btn"
                  style={{ background: 'var(--success)', color: 'white' }}
                  onClick={() => handleOverride('approve')}
                  disabled={!overrideComment.trim()}
                >
                  Force Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompanyExpenses;
