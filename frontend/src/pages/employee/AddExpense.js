import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, CURRENCIES } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ocrAPI } from '../../services/api';

const categories = [
  { id: 'travel', name: 'Travel', icon: '✈️', description: 'Flights, hotels, transport' },
  { id: 'it_equipment', name: 'IT Equipment', icon: '💻', description: 'Hardware, software, peripherals' },
  { id: 'office_supplies', name: 'Office Supplies', icon: '📎', description: 'Stationery, furniture' },
  { id: 'food', name: 'Food & Meals', icon: '🍽️', description: 'Team meals, client entertainment' },
  { id: 'others', name: 'Others', icon: '📦', description: 'Miscellaneous expenses' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function AddExpense() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrError, setOcrError] = useState('');
  
  const [expense, setExpense] = useState({
    category: '',
    description: '',
    amount: '',
    currency: user?.preferredCurrency || 'USD',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    receipt: null,
    receiptPreview: null
  });

  const handleCategorySelect = (categoryId) => {
    setExpense({ ...expense, category: categoryId });
    setStep(2);
  };

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target?.files[0];
    if (file && file.type.startsWith('image/')) {
      processReceipt(file);
    }
  }, []);

  const processReceipt = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      setExpense(prev => ({
        ...prev,
        receipt: file,
        receiptPreview: e.target.result
      }));
      setIsProcessingOCR(true);
      setOcrError('');
      setOcrResult(null);

      const formData = new FormData();
      formData.append('receipt', file);

      try {
        const response = await ocrAPI.processReceipt(formData);
        const result = response.data || {};

        const normalizedAmount = result.amount != null ? String(result.amount) : '';
        const normalizedMerchant = result.merchant || '';
        const normalizedDate = result.date || '';
        const normalizedConfidence = typeof result.confidence === 'number' ? result.confidence : 0;

        const parsedOcr = {
          merchant: normalizedMerchant,
          amount: normalizedAmount,
          date: normalizedDate,
          confidence: Number(normalizedConfidence)
        };

        setOcrResult(parsedOcr);
        setExpense(prev => ({
          ...prev,
          merchant: normalizedMerchant,
          amount: normalizedAmount,
          date: normalizedDate || prev.date
        }));
      } catch (error) {
        setOcrError('Unable to extract receipt data. Please verify the image and try again.');
      } finally {
        setIsProcessingOCR(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    // In real app, would submit to API
    console.log('Submitting expense:', expense);
    navigate('/my-expenses');
  };

  const getCurrencySymbol = (code) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const getFieldStatus = (field) => {
    if (!ocrResult) return 'pending';
    return ocrResult[field] ? 'matched' : 'missing';
  };

  // Step title function - used in header
  // eslint-disable-next-line no-unused-vars
  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Select Category';
      case 2: return 'Upload Receipt';
      case 3: return 'Review & Submit';
      default: return 'Add Expense';
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <div>
          <h1>Add Expense</h1>
          <p className="text-muted">Submit a new expense for reimbursement</p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="progress-steps" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '40px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20%',
          right: '20%',
          height: '2px',
          background: 'var(--border)'
        }}>
          <motion.div 
            style={{ 
              height: '100%', 
              background: 'var(--primary)',
              transformOrigin: 'left'
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (step - 1) / 2 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {[1, 2, 3].map(s => (
          <div 
            key={s} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '120px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <motion.div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: s <= step ? 'var(--primary)' : 'var(--bg-secondary)',
                color: s <= step ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                marginBottom: '8px',
                border: '3px solid var(--bg-primary)'
              }}
              animate={{ 
                scale: s === step ? 1.1 : 1,
                boxShadow: s === step ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              {s < step ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : s}
            </motion.div>
            <span style={{ 
              fontSize: '13px', 
              color: s === step ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: s === step ? 600 : 400
            }}>
              {s === 1 ? 'Category' : s === 2 ? 'Details' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Category Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>What type of expense is this?</h2>
            <p className="text-muted" style={{ textAlign: 'center', marginBottom: '32px' }}>
              Select the category that best matches your expense
            </p>

            <motion.div 
              className="category-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {categories.map(cat => (
                <motion.div
                  key={cat.id}
                  className="card category-card"
                  variants={itemVariants}
                  onClick={() => handleCategorySelect(cat.id)}
                  whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '24px',
                    border: expense.category === cat.id ? '2px solid var(--primary)' : '2px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{cat.icon}</div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{cat.name}</div>
                  <div className="text-muted" style={{ fontSize: '13px' }}>{cat.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Step 2: Details & Receipt */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card" style={{ padding: '28px' }}>
              <h2 style={{ marginBottom: '18px' }}>Receipt scanning & expense details</h2>
              <p className="text-muted" style={{ marginBottom: '28px' }}>
                Upload a receipt and let the smart OCR pipeline fill in the key expense fields automatically.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 1.1fr) 1fr',
                gap: '24px',
                alignItems: 'start'
              }}>
                <div style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Receipt preview</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>Scan result will appear once upload completes.</div>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '999px', background: isProcessingOCR ? 'var(--info-light)' : 'var(--success-light)', color: isProcessingOCR ? 'var(--info-dark)' : 'var(--success-dark)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span>{isProcessingOCR ? 'Scanning' : 'Ready'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div
                      className="dropzone"
                      onDrop={handleFileDrop}
                      onDragOver={(e) => e.preventDefault()}
                      style={{
                        minHeight: '320px',
                        border: '2px dashed var(--border-default)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '24px',
                        cursor: 'pointer',
                        background: expense.receiptPreview ? '#fff' : 'var(--bg-subtle)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => document.getElementById('receipt-input').click()}
                    >
                      <input
                        id="receipt-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileDrop}
                        style={{ display: 'none' }}
                      />

                      {expense.receiptPreview ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <img
                            src={expense.receiptPreview}
                            alt="Receipt"
                            style={{
                              width: '100%',
                              maxHeight: '320px',
                              objectFit: 'contain',
                              borderRadius: '18px',
                              filter: isProcessingOCR ? 'blur(1px)' : 'none',
                              opacity: isProcessingOCR ? 0.7 : 1,
                              transition: 'all 0.2s ease'
                            }}
                          />

                          {isProcessingOCR && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(255, 255, 255, 0.72)',
                              borderRadius: '18px'
                            }}>
                              <div className="spinner" style={{ width: '42px', height: '42px', marginBottom: '14px' }} />
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Analyzing receipt</div>
                              <div className="text-muted" style={{ fontSize: '13px', marginTop: '6px' }}>Looking for merchant, amount, and date</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-tertiary)' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '18px' }}>
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop or select a receipt image</div>
                          <div className="text-muted">Supported: JPG, PNG, PDF. We’ll auto-populate the expense fields.</div>
                        </div>
                      )}
                    </div>

                    {ocrError && (
                      <div style={{
                        marginTop: '18px',
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'var(--error-light)',
                        color: 'var(--error-dark)'
                      }}>
                        {ocrError}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '18px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '18px 22px',
                    borderRadius: '22px',
                    background: 'var(--bg-default)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Extracted data</div>
                      <div className="text-muted" style={{ fontSize: '13px' }}>Fields update automatically when OCR completes.</div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-info">Live OCR</span>
                      {ocrResult && (
                        <span className="badge badge-success">{Math.round(ocrResult.confidence * 100)}% confidence</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Merchant / Vendor</span>
                        <span style={{ color: getFieldStatus('merchant') === 'matched' ? 'var(--success-dark)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {ocrResult ? (getFieldStatus('merchant') === 'matched' ? 'Auto-filled' : 'Review manually') : 'Waiting'}
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={expense.merchant}
                        onChange={(e) => setExpense({...expense, merchant: e.target.value})}
                        placeholder="e.g. Starbucks Coffee"
                        style={{
                          borderColor: getFieldStatus('merchant') === 'matched' ? 'var(--success)' : undefined
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Amount</span>
                        <span style={{ color: getFieldStatus('amount') === 'matched' ? 'var(--success-dark)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {ocrResult ? (getFieldStatus('amount') === 'matched' ? 'Confirmed' : 'Highlight') : 'Waiting'}
                        </span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                        <select
                          className="input"
                          value={expense.currency}
                          onChange={(e) => setExpense({...expense, currency: e.target.value})}
                          style={{ width: '100%' }}
                        >
                          {CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="input"
                          value={expense.amount}
                          onChange={(e) => setExpense({...expense, amount: e.target.value})}
                          placeholder="0.00"
                          step="0.01"
                          style={{
                            borderColor: getFieldStatus('amount') === 'matched' ? 'var(--success)' : undefined
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>Date</span>
                        <span style={{ color: getFieldStatus('date') === 'matched' ? 'var(--success-dark)' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {ocrResult ? (getFieldStatus('date') === 'matched' ? 'Detected' : 'Adjust if needed') : 'Waiting'}
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input"
                        value={expense.date}
                        onChange={(e) => setExpense({...expense, date: e.target.value})}
                        style={{
                          borderColor: getFieldStatus('date') === 'matched' ? 'var(--success)' : undefined
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Description *</label>
                      <textarea
                        className="input"
                        rows={4}
                        value={expense.description}
                        onChange={(e) => setExpense({...expense, description: e.target.value})}
                        placeholder="Describe the purpose of this expense..."
                        style={{ minHeight: '110px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, minWidth: '180px' }}
                  onClick={() => setStep(3)}
                  disabled={!expense.amount || !expense.description}
                >
                  Continue to Review
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>Review Your Expense</h2>

              <div style={{ display: 'grid', gridTemplateColumns: expense.receiptPreview ? '1fr 1fr' : '1fr', gap: '32px' }}>
                <div>
                  <div className="review-item" style={{ marginBottom: '20px' }}>
                    <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Category</div>
                    <div style={{ fontWeight: 500 }}>
                      {categories.find(c => c.id === expense.category)?.icon}{' '}
                      {categories.find(c => c.id === expense.category)?.name}
                    </div>
                  </div>

                  <div className="review-item" style={{ marginBottom: '20px' }}>
                    <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Amount</div>
                    <div style={{ fontWeight: 600, fontSize: '24px', fontFamily: 'var(--font-mono)' }}>
                      {getCurrencySymbol(expense.currency)}{parseFloat(expense.amount).toFixed(2)}
                    </div>
                    {expense.currency !== user?.preferredCurrency && (
                      <div className="text-muted" style={{ fontSize: '13px' }}>
                        Will be converted to {user?.preferredCurrency} for records
                      </div>
                    )}
                  </div>

                  <div className="review-item" style={{ marginBottom: '20px' }}>
                    <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontWeight: 500 }}>{expense.date}</div>
                  </div>

                  {expense.merchant && (
                    <div className="review-item" style={{ marginBottom: '20px' }}>
                      <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Merchant</div>
                      <div style={{ fontWeight: 500 }}>{expense.merchant}</div>
                    </div>
                  )}

                  <div className="review-item" style={{ marginBottom: '20px' }}>
                    <div className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Description</div>
                    <div>{expense.description}</div>
                  </div>
                </div>

                {expense.receiptPreview && (
                  <div>
                    <div className="text-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>Receipt</div>
                    <img 
                      src={expense.receiptPreview} 
                      alt="Receipt" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                      }} 
                    />
                  </div>
                )}
              </div>

              {/* Workflow Info */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span style={{ fontWeight: 600 }}>Approval Workflow</span>
                </div>
                <div className="text-muted" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  This expense will be routed through the <strong>{categories.find(c => c.id === expense.category)?.name}</strong> workflow. 
                  Your manager will be notified for approval. Expected processing time: 1-2 business days.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }}>
                  Save as Draft
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={handleSubmit}
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddExpense;
