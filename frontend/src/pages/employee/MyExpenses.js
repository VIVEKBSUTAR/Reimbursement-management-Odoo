import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, CURRENCIES } from '../../contexts/AuthContext';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const demoExpenses = [
  { 
    id: '1', 
    category: 'Travel',
    description: 'Flight to NYC for client meeting',
    amountSubmitted: 450.00,
    currencySubmitted: 'GBP',
    amountPreferred: 450.00,
    status: 'approved',
    submittedAt: '2024-03-28',
    flowName: 'Standard Travel'
  },
  { 
    id: '2', 
    category: 'Food',
    description: 'Team lunch - project kickoff',
    amountSubmitted: 85.50,
    currencySubmitted: 'GBP',
    amountPreferred: 85.50,
    status: 'pending',
    submittedAt: '2024-03-27',
    flowName: 'Quick Approval'
  },
  { 
    id: '3', 
    category: 'IT Equipment',
    description: 'External monitor for WFH',
    amountSubmitted: 320.00,
    currencySubmitted: 'GBP',
    amountPreferred: 320.00,
    status: 'approved',
    submittedAt: '2024-03-25',
    flowName: 'Equipment Flow'
  },
  { 
    id: '4', 
    category: 'Office Supplies',
    description: 'Notebooks and pens',
    amountSubmitted: 45.00,
    currencySubmitted: 'GBP',
    amountPreferred: 45.00,
    status: 'rejected',
    submittedAt: '2024-03-24',
    flowName: 'Office Supplies'
  },
  { 
    id: '5', 
    category: 'Travel',
    description: 'Uber to airport',
    amountSubmitted: 65.00,
    currencySubmitted: 'GBP',
    amountPreferred: 65.00,
    status: 'draft',
    submittedAt: '2024-03-20',
    flowName: null
  },
];

const monthlyData = [
  { month: 'Jan', amount: 850 },
  { month: 'Feb', amount: 1200 },
  { month: 'Mar', amount: 965 },
  { month: 'Apr', amount: 0 },
];

const categoryData = [
  { name: 'Travel', value: 515, color: '#6366f1' },
  { name: 'Food', value: 85.5, color: '#10b981' },
  { name: 'IT Equipment', value: 320, color: '#f59e0b' },
  { name: 'Office Supplies', value: 45, color: '#8b5cf6' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function MyExpenses() {
  const { user } = useAuth();
  const [expenses] = useState(demoExpenses);
  const [filterStatus, setFilterStatus] = useState('all');

  const currency = user?.preferredCurrency || 'GBP';
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '£';

  const formatAmount = (amount) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const filteredExpenses = filterStatus === 'all' 
    ? expenses 
    : expenses.filter(e => e.status === filterStatus);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountPreferred, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Travel':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
      case 'IT Equipment':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
      case 'Office Supplies':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
      case 'Food':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
      default:
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>My Expenses</h1>
          <p className="text-muted">Track and manage your expense submissions • Displayed in {currency}</p>
        </div>
        <a href="/add-expense" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Expense
        </a>
      </header>

      {/* Summary Cards */}
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
            <div className="stat-value">{formatAmount(totalExpenses)}</div>
            <div className="stat-label">Total This Year</div>
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
            <div className="stat-value">{pendingExpenses.length}</div>
            <div className="stat-label">Pending Approval</div>
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
            <div className="stat-value">{approvedExpenses.length}</div>
            <div className="stat-label">Approved This Month</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10M18 20V4M6 20v-4"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatAmount(monthlyData[2].amount)}</div>
            <div className="stat-label">This Month</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ marginBottom: '20px' }}>Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value) => [formatAmount(value), 'Spent']}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                strokeWidth={2}
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ marginBottom: '20px' }}>By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value) => [formatAmount(value), '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {categoryData.map(cat => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: cat.color }} />
                <span className="text-muted">{cat.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: '16px' }}>
        {['all', 'pending', 'approved', 'rejected', 'draft'].map(status => (
          <button
            key={status}
            className={`tab ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '11px',
                background: filterStatus === status ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {expenses.filter(e => e.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <motion.div 
        className="card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredExpenses.length > 0 ? (
          <div className="expense-list">
            {filteredExpenses.map(expense => (
              <motion.div 
                key={expense.id}
                className="expense-item"
                variants={itemVariants}
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  {getCategoryIcon(expense.category)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{expense.description}</div>
                  <div className="text-muted" style={{ fontSize: '13px' }}>
                    {expense.category} • {expense.submittedAt}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginRight: '16px' }}>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {formatAmount(expense.amountPreferred)}
                  </div>
                  {expense.flowName && (
                    <div className="text-muted" style={{ fontSize: '12px' }}>
                      {expense.flowName}
                    </div>
                  )}
                </div>

                {getStatusBadge(expense.status)}

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M9 17H7A5 5 0 017 7h2m6 10h2a5 5 0 000-10h-2m-8 5h12"/>
            </svg>
            <h3>No expenses found</h3>
            <p>No expenses match the selected filter</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default MyExpenses;
