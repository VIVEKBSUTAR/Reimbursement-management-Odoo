# 🚀 IRMS - Intelligent Reimbursement Management System ...

> A rule-driven reimbursement system with dynamic approval workflow orchestration

## 🎯 Overview

IRMS dynamically generates approval workflows based on configurable business rules:
- "IF amount > $10,000 → Add Manager approval"
- "IF category = Equipment → Add Admin approval"

## 🚀 Quick Start

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```

Access Django Admin: **http://localhost:8000/admin**
- Email: `admin@techcorp.com`
- Password: `admin123`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

## 📊 Database Schema

12 tables: companies, users, reporting_structure, currency_master, exchange_rate_history, expenses, expense_items, rules, approval_flows, approval_steps, approvers, approval_logs

## 🔧 Tech Stack

- **Backend**: Django 5.0 + Django REST Framework + SQLite
- **Frontend**: React 18
- **Auth**: JWT-based authentication

## 📡 Key API Endpoints

```
POST   /api/auth/login/
GET    /api/expenses/
POST   /api/expenses/
GET    /api/approvals/pending/
POST   /api/approvals/{id}/approve/
```

## 🎨 Frontend Design (Google Stitch)

Professional UI designed with "Financial Architect" design system:

**View the designs:** https://stitch.google.com/app/projects/10981540997857756161

**6 Screens:**
1. **Login Page** - Clean enterprise authentication
2. **Employee Dashboard** - Summary cards, expense list, quick actions
3. **Submit Expense Form** - Multi-currency input, receipt upload, OCR preview
4. **Manager Approval Queue** - Pending approvals with bulk actions
5. **Expense Detail & Approval Journey** - Timeline visualization of workflow
6. **Admin Rules Configuration** - Rule builder with condition editor

## 📝 License

MIT License
