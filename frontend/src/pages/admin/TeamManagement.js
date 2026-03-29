import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const demoUsers = [
  { id: '1', firstName: 'Alex', lastName: 'Admin', email: 'admin@techcorp.com', role: 'admin', managerId: null, status: 'active', preferredCurrency: 'USD' },
  { id: '2', firstName: 'Morgan', lastName: 'Manager', email: 'manager@techcorp.com', role: 'manager', managerId: '1', status: 'active', preferredCurrency: 'EUR' },
  { id: '3', firstName: 'Emma', lastName: 'Employee', email: 'employee@techcorp.com', role: 'employee', managerId: '2', status: 'active', preferredCurrency: 'GBP' },
  { id: '4', firstName: 'James', lastName: 'Wilson', email: 'james@techcorp.com', role: 'employee', managerId: '2', status: 'active', preferredCurrency: 'USD' },
  { id: '5', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@techcorp.com', role: 'employee', managerId: '2', status: 'pending', preferredCurrency: 'USD' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function TeamManagement() {
  const { company } = useAuth();
  const [users, setUsers] = useState(demoUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee',
    managerId: ''
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getManagerName = (managerId) => {
    if (!managerId) return '—';
    const manager = users.find(u => u.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : '—';
  };

  const handleAddUser = () => {
    const user = {
      id: String(Date.now()),
      ...newUser,
      status: 'pending',
      preferredCurrency: company?.baseCurrency || 'USD'
    };
    setUsers([...users, user]);
    setShowAddModal(false);
    setNewUser({ firstName: '', lastName: '', email: '', role: 'employee', managerId: '' });
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: '#fef3c7', text: '#92400e', label: 'Admin' },
      manager: { bg: '#ede9fe', text: '#6d28d9', label: 'Manager' },
      employee: { bg: '#d1fae5', text: '#065f46', label: 'Employee' }
    };
    const config = colors[role] || colors.employee;
    return (
      <span className="status-badge" style={{ background: config.bg, color: config.text }}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="status-badge" style={{ background: '#d1fae5', color: '#065f46' }}>Active</span>;
    }
    return <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>Invite Sent</span>;
  };

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Team Management</h1>
          <p className="text-muted">Manage employees, roles, and reporting structure</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Add User
        </button>
      </header>

      {/* Stats Cards */}
      <motion.div 
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
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
            <div className="stat-value">{users.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Active Users</div>
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
            <div className="stat-value">{users.filter(u => u.status === 'pending').length}</div>
            <div className="stat-label">Pending Invites</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{users.filter(u => u.role === 'manager').length}</div>
            <div className="stat-label">Managers</div>
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="input"
            style={{ width: 'auto' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
            <option value="employee">Employees</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <motion.div 
        className="card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Reports To</th>
              <th>Status</th>
              <th>Currency</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <motion.tr 
                key={user.id}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar" style={{ 
                      width: '36px', 
                      height: '36px',
                      background: user.role === 'admin' ? '#f59e0b' : user.role === 'manager' ? '#8b5cf6' : '#10b981',
                      fontSize: '13px'
                    }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td className="text-muted">{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td className="text-muted">{getManagerName(user.managerId)}</td>
                <td>{getStatusBadge(user.status)}</td>
                <td>
                  <span style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    {user.preferredCurrency}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-ghost"
                    style={{ padding: '6px 12px' }}
                    onClick={() => console.log('Edit user:', user.id)}
                  >
                    Edit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="17" y1="11" x2="23" y2="11"/>
            </svg>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 500
            }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              className="modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '820px',
                borderRadius: '28px',
                padding: '28px',
                background: 'rgba(255, 255, 255, 0.94)',
                border: '1px solid rgba(99, 102, 241, 0.14)',
                boxShadow: '0 32px 90px rgba(15, 23, 42, 0.18)',
                backdropFilter: 'blur(22px)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', marginBottom: '28px', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                    Premium workflow
                  </div>
                  <h2 style={{ marginTop: '12px', fontSize: '1.6rem' }}>Invite a new team member</h2>
                  <p style={{ marginTop: '12px', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.75 }}>
                    Send a polished onboarding invite with role setup, reporting assignment, and automatic currency defaults.
                  </p>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowAddModal(false)}
                  style={{ fontSize: '1.5rem', lineHeight: 1, padding: '6px 12px' }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '24px' }}>
                <div style={{
                  borderRadius: '24px',
                  padding: '24px',
                  background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12), rgba(236, 241, 255, 0.88))',
                  border: '1px solid rgba(99, 102, 241, 0.14)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '16px' }}>Why this matters</div>
                  <ul style={{ display: 'grid', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <li>Beautiful onboarding experience for employees</li>
                    <li>Corporate-ready role and manager assignment</li>
                    <li>Currency aligned to company base by default</li>
                    <li>Glassmorphic premium brand feel</li>
                  </ul>
                </div>

                <div style={{ display: 'grid', gap: '18px' }}>
                  <div style={{ display: 'grid', gap: '16px', padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.98)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>First Name</label>
                      <input
                        type="text"
                        className="input"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                        placeholder="John"
                      />
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name</label>
                      <input
                        type="text"
                        className="input"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
                      <input
                        type="email"
                        className="input"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="jane@company.com"
                      />
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
                      <select
                        className="input"
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Reports To</label>
                      <select
                        className="input"
                        value={newUser.managerId}
                        onChange={(e) => setNewUser({...newUser, managerId: e.target.value})}
                      >
                        <option value="">Select Manager</option>
                        {managers.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.firstName} {m.lastName} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddUser}
                  disabled={!newUser.firstName || !newUser.lastName || !newUser.email}
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TeamManagement;
