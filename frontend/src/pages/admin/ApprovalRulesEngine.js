import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const demoFlows = [
  {
    id: '1',
    name: 'Standard Travel Flow',
    category: 'Travel',
    version: 2,
    isActive: true,
    steps: [
      { id: 's1', stepNumber: 1, approverType: 'MANAGER', approverValue: 'Direct Manager', isRequired: true },
      { id: 's2', stepNumber: 2, approverType: 'ROLE', approverValue: 'Finance Team', isRequired: false, threshold: 60 },
    ],
    rules: [
      { id: 'r1', ruleType: 'Percentage', thresholdPct: 60, description: '60% of Finance Team must approve' }
    ]
  },
  {
    id: '2',
    name: 'High Value Equipment',
    category: 'IT Equipment',
    version: 1,
    isActive: true,
    steps: [
      { id: 's3', stepNumber: 1, approverType: 'MANAGER', approverValue: 'Direct Manager', isRequired: true },
      { id: 's4', stepNumber: 2, approverType: 'SPECIFIC', approverValue: 'CFO', isRequired: true },
    ],
    rules: [
      { id: 'r2', ruleType: 'Specific', description: 'CFO approval required for equipment > $1,000' }
    ]
  },
  {
    id: '3',
    name: 'Office Supplies',
    category: 'Office Supplies',
    version: 1,
    isActive: false,
    steps: [
      { id: 's5', stepNumber: 1, approverType: 'MANAGER', approverValue: 'Direct Manager', isRequired: true },
    ],
    rules: []
  }
];

const categories = ['Travel', 'IT Equipment', 'Office Supplies', 'Food', 'Others'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function ApprovalRulesEngine() {
  const [flows, setFlows] = useState(demoFlows);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [expandedFlow, setExpandedFlow] = useState(null);

  const [newFlow, setNewFlow] = useState({
    name: '',
    category: 'Travel',
    steps: [{ stepNumber: 1, approverType: 'MANAGER', approverValue: 'Direct Manager', isRequired: true }]
  });

  const filteredFlows = selectedCategory === 'all' 
    ? flows 
    : flows.filter(f => f.category === selectedCategory);

  const toggleFlowActive = (id) => {
    setFlows(flows.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const handleAddStep = () => {
    setNewFlow({
      ...newFlow,
      steps: [
        ...newFlow.steps,
        { 
          stepNumber: newFlow.steps.length + 1, 
          approverType: 'ROLE', 
          approverValue: '', 
          isRequired: false,
          threshold: 50
        }
      ]
    });
  };

  const handleRemoveStep = (index) => {
    if (newFlow.steps.length > 1) {
      const updated = newFlow.steps.filter((_, i) => i !== index);
      setNewFlow({ ...newFlow, steps: updated.map((s, i) => ({ ...s, stepNumber: i + 1 })) });
    }
  };

  const handleStepChange = (index, field, value) => {
    const updated = [...newFlow.steps];
    updated[index] = { ...updated[index], [field]: value };
    setNewFlow({ ...newFlow, steps: updated });
  };

  const handleCreateFlow = () => {
    const flow = {
      id: String(Date.now()),
      ...newFlow,
      version: 1,
      isActive: true,
      rules: []
    };
    setFlows([...flows, flow]);
    setShowFlowModal(false);
    setNewFlow({
      name: '',
      category: 'Travel',
      steps: [{ stepNumber: 1, approverType: 'MANAGER', approverValue: 'Direct Manager', isRequired: true }]
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Travel':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
      case 'IT Equipment':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
      case 'Office Supplies':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
      case 'Food':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
      default:
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    }
  };

  const getApproverTypeLabel = (type) => {
    switch (type) {
      case 'MANAGER': return 'Direct Manager';
      case 'ROLE': return 'Role-based';
      case 'SPECIFIC': return 'Specific User';
      default: return type;
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Approval Rules Engine</h1>
          <p className="text-muted">Configure approval workflows for different expense categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowFlowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Flow
        </button>
      </header>

      {/* Info Card */}
      <motion.div 
        className="card"
        style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, var(--primary-50) 0%, #ede9fe 100%)',
          border: '1px solid var(--primary-100)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-700)' }}>How Approval Flows Work</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Each flow defines a sequence of approval steps. When an employee submits an expense that matches 
              a flow's category, the system automatically routes it through the defined steps. You can require 
              manager approval, specific users (like CFO), or a percentage of a role group.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button 
          className={`tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Flows
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Flows Grid */}
      <motion.div 
        className="flows-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredFlows.map(flow => (
          <motion.div 
            key={flow.id}
            className="card flow-card"
            variants={itemVariants}
            style={{ 
              opacity: flow.isActive ? 1 : 0.6,
              border: expandedFlow === flow.id ? '2px solid var(--primary)' : undefined
            }}
          >
            <div className="flow-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  {getCategoryIcon(flow.category)}
                </div>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{flow.name}</h3>
                  <span className="text-muted" style={{ fontSize: '13px' }}>
                    {flow.category} • v{flow.version}
                  </span>
                </div>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={flow.isActive}
                  onChange={() => toggleFlowActive(flow.id)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Steps Preview */}
            <div className="flow-steps" style={{ marginBottom: '16px' }}>
              {flow.steps.map((step, idx) => (
                <div key={step.id} className="flow-step" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  marginBottom: idx < flow.steps.length - 1 ? '8px' : 0
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: step.isRequired ? 'var(--primary)' : 'var(--border)',
                    color: step.isRequired ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    {step.stepNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{step.approverValue}</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>
                      {getApproverTypeLabel(step.approverType)}
                      {step.threshold && ` • ${step.threshold}% threshold`}
                    </div>
                  </div>
                  {step.isRequired && (
                    <span className="status-badge" style={{ 
                      background: '#fef3c7', 
                      color: '#92400e',
                      fontSize: '11px'
                    }}>
                      Required
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-ghost" 
                style={{ flex: 1 }}
                onClick={() => setExpandedFlow(expandedFlow === flow.id ? null : flow.id)}
              >
                {expandedFlow === flow.id ? 'Collapse' : 'View Details'}
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }}>
                Edit
              </button>
            </div>
          </motion.div>
        ))}

        {filteredFlows.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <h3>No flows in this category</h3>
            <p>Create a new approval flow to get started</p>
          </div>
        )}
      </motion.div>

      {/* Create Flow Modal */}
      <AnimatePresence>
        {showFlowModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFlowModal(false)}
          >
            <motion.div 
              className="modal"
              style={{ maxWidth: '600px' }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Create Approval Flow</h2>
                <button className="modal-close" onClick={() => setShowFlowModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Flow Name</label>
                    <input
                      type="text"
                      className="input"
                      value={newFlow.name}
                      onChange={(e) => setNewFlow({...newFlow, name: e.target.value})}
                      placeholder="e.g., High Value Travel"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="input"
                      value={newFlow.category}
                      onChange={(e) => setNewFlow({...newFlow, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{ fontWeight: 600 }}>Approval Steps</label>
                    <button className="btn btn-ghost" onClick={handleAddStep}>
                      + Add Step
                    </button>
                  </div>

                  {newFlow.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className="flow-step-editor"
                      style={{
                        padding: '16px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Step {step.stepNumber}</span>
                        {newFlow.steps.length > 1 && (
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: '4px 8px', color: 'var(--error)' }}
                            onClick={() => handleRemoveStep(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="form-grid" style={{ gap: '12px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '13px' }}>Approver Type</label>
                          <select
                            className="input"
                            value={step.approverType}
                            onChange={(e) => handleStepChange(index, 'approverType', e.target.value)}
                          >
                            <option value="MANAGER">Direct Manager</option>
                            <option value="ROLE">Role Group</option>
                            <option value="SPECIFIC">Specific User</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '13px' }}>Approver Value</label>
                          <input
                            type="text"
                            className="input"
                            value={step.approverValue}
                            onChange={(e) => handleStepChange(index, 'approverValue', e.target.value)}
                            placeholder={step.approverType === 'ROLE' ? 'Finance Team' : 'CFO'}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={step.isRequired}
                            onChange={(e) => handleStepChange(index, 'isRequired', e.target.checked)}
                          />
                          <span style={{ fontSize: '13px' }}>Required</span>
                        </label>

                        {step.approverType === 'ROLE' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px' }}>Threshold:</label>
                            <input
                              type="number"
                              className="input"
                              style={{ width: '70px', padding: '6px 10px' }}
                              value={step.threshold || 50}
                              onChange={(e) => handleStepChange(index, 'threshold', parseInt(e.target.value))}
                              min="1"
                              max="100"
                            />
                            <span style={{ fontSize: '13px' }}>%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowFlowModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateFlow}
                  disabled={!newFlow.name}
                >
                  Create Flow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ApprovalRulesEngine;
