import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, ROLES } from '../contexts/AuthContext';

// Icons
const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  expenses: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 17H7A5 5 0 017 7h2m6 10h2a5 5 0 000-10h-2m-8 5h12"/></svg>,
  add: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="10"/></svg>,
  approvals: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  team: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>,
  rules: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  company: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M3 7v14m4-14v14m4-14v14m4-14v14m4-14v14M3 7l9-4 9 4"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
};

const getNavItems = (role, pendingApprovals = 0) => {
  const employeeItems = [
    { 
      section: 'My Work',
      items: [
        { to: '/my-expenses', label: 'My Expenses', icon: Icons.expenses },
        { to: '/add-expense', label: 'Add Expense', icon: Icons.add },
        { to: '/settings', label: 'Settings', icon: Icons.settings },
      ]
    }
  ];

  const managerItems = [
    { 
      section: 'Approvals',
      items: [
        { to: '/approvals', label: 'Review Queue', icon: Icons.approvals, badge: pendingApprovals > 0 ? pendingApprovals : null },
      ]
    },
    ...employeeItems.map(section => ({
      ...section,
      section: 'My Work'
    }))
  ];

  const adminItems = [
    { 
      section: 'Administration',
      items: [
        { to: '/admin/team', label: 'Team Management', icon: Icons.team },
        { to: '/admin/rules', label: 'Approval Rules', icon: Icons.rules },
        { to: '/admin/expenses', label: 'Company Expenses', icon: Icons.company },
      ]
    }
  ];

  switch (role) {
    case ROLES.ADMIN:
      return adminItems;
    case ROLES.MANAGER:
      return managerItems;
    case ROLES.EMPLOYEE:
    default:
      return employeeItems;
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case ROLES.ADMIN: return 'Administrator';
    case ROLES.MANAGER: return 'Manager';
    case ROLES.EMPLOYEE: return 'Employee';
    default: return 'User';
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case ROLES.ADMIN: return '#f59e0b';
    case ROLES.MANAGER: return '#8b5cf6';
    case ROLES.EMPLOYEE: return '#10b981';
    default: return '#6b7280';
  }
};

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, company, logout, isAdmin, isManager } = useAuth();
  
  // Demo: pending approvals count
  const pendingApprovals = isManager || isAdmin ? 3 : 0;
  
  const navItems = getNavItems(user?.role, pendingApprovals);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">💎</div>
            <div>
              <h1>IRMS</h1>
              <span>{company?.name || 'Expense Management'}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section, idx) => (
            <div key={idx} className="sidebar-section">
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  end={item.to === '/'}
                >
                  {item.icon}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="avatar" style={{ background: getRoleColor(user?.role) }}>
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{getRoleLabel(user?.role)}</div>
            </div>
            {Icons.logout}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export default Layout;
