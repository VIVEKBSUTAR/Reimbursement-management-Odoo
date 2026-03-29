import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    const savedCompany = localStorage.getItem('company');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Demo login - simulates different roles
    const demoUsers = {
      'admin@techcorp.com': {
        id: '1',
        email: 'admin@techcorp.com',
        firstName: 'Alex',
        lastName: 'Admin',
        role: ROLES.ADMIN,
        preferredCurrency: 'USD',
        managerId: null,
        companyId: '1'
      },
      'manager@techcorp.com': {
        id: '2',
        email: 'manager@techcorp.com',
        firstName: 'Morgan',
        lastName: 'Manager',
        role: ROLES.MANAGER,
        preferredCurrency: 'EUR',
        managerId: '1',
        companyId: '1'
      },
      'employee@techcorp.com': {
        id: '3',
        email: 'employee@techcorp.com',
        firstName: 'Emma',
        lastName: 'Employee',
        role: ROLES.EMPLOYEE,
        preferredCurrency: 'GBP',
        managerId: '2',
        companyId: '1'
      }
    };

    const demoCompany = {
      id: '1',
      name: 'TechCorp Inc.',
      baseCurrency: 'USD'
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const matchedUser = demoUsers[email];
    if (matchedUser && password === 'demo123') {
      setUser(matchedUser);
      setCompany(demoCompany);
      localStorage.setItem('user', JSON.stringify(matchedUser));
      localStorage.setItem('company', JSON.stringify(demoCompany));
      localStorage.setItem('token', 'demo-jwt-token');
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('token');
  };

  const updatePreferredCurrency = (currencyCode) => {
    const updatedUser = { ...user, preferredCurrency: currencyCode };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const isEmployee = user?.role === ROLES.EMPLOYEE;

  // Managers also have employee capabilities
  const canSubmitExpenses = isEmployee || isManager;
  const canApproveExpenses = isManager || isAdmin;
  const canManageUsers = isAdmin;
  const canManageRules = isAdmin;

  const value = {
    user,
    company,
    loading,
    login,
    logout,
    updatePreferredCurrency,
    isAdmin,
    isManager,
    isEmployee,
    canSubmitExpenses,
    canApproveExpenses,
    canManageUsers,
    canManageRules,
    CURRENCIES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
