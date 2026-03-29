# IRMS Backend - Django REST API

## ✅ What's Already Set Up

- ✅ Project structure created
- ✅ All Django apps created
- ✅ Database models defined (12 tables)
- ✅ Settings configured
- ✅ URL routing structure
- ✅ Requirements.txt

## 📋 Database Models Created

1. **companies** - Company/Organization
2. **users** - Custom user with roles (Admin/Manager/Employee)
3. **reporting_structure** - Manager-employee hierarchy
4. **currency_master** - Cached currency data
5. **exchange_rate_history** - Historical rates for fallback
6. **expenses** - Main expense records
7. **expense_items** - Line items for expenses
8. **rules** - Business rules for approval workflows
9. **approval_flows** - Workflow instances
10. **approval_steps** - Individual approval steps
11. **approvers** - Approvers for each step
12. **approval_logs** - Complete audit trail
13. **ocr_extractions** - OCR processing results

## 🚀 Quick Start

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Create PostgreSQL Database

```bash
createdb irms_db
# Or using psql:
psql postgres
CREATE DATABASE irms_db;
\q
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Server

```bash
python manage.py runserver
```

## 📡 API Endpoints Structure

```
/api/auth/
    - POST /signup
    - POST /login
    - POST /token/refresh

/api/companies/
    - GET /
    - POST /
    
/api/users/
    - GET /
    - POST /
    - GET /{id}/
    - PUT /{id}/
    - POST /{id}/set-manager/

/api/expenses/
    - GET /
    - POST /
    - GET /{id}/
    - PUT /{id}/
    - DELETE /{id}/

/api/approvals/
    - GET /pending/
    - POST /{id}/approve/
    - POST /{id}/reject/

/api/rules/
    - GET /
    - POST /
    - PUT /{id}/
    - DELETE /{id}/

/api/currencies/
    - GET /
    - POST /convert/

/api/audit/
    - GET /expenses/{id}/timeline/

/api/ocr/
    - POST /process/
```

## 🔧 Next Steps to Complete Implementation

### 1. Implement Serializers

Create serializers for each model in `apps/<app>/serializers.py`:

**Example for User:**
```python
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'company']
        extra_kwargs = {'password': {'write_only': True}}
```

### 2. Implement Views (API Endpoints)

Create ViewSets in `apps/<app>/views.py`:

**Example:**
```python
from rest_framework import viewsets, permissions
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
```

### 3. Implement Workflow Engine

In `apps/approvals/workflow_engine.py`, implement:
- Rule evaluation
- Flow generation
- Step execution
- State machine

**Key Functions:**
```python
def evaluate_rules(expense):
    # Returns list of matched rules
    pass

def generate_approval_flow(expense):
    # Creates ApprovalFlow and ApprovalSteps based on rules
    pass

def execute_approval(approver_id, action, comments):
    # Processes approve/reject action
    pass
```

### 4. Implement Rule Engine

In `apps/rules/rule_engine.py`:

```python
def evaluate_condition(rule, expense):
    # Checks if rule condition matches expense
    pass

def evaluate_amount_condition(expense, config):
    # Amount-based logic
    pass

def evaluate_category_condition(expense, config):
    # Category-based logic
    pass
```

### 5. Implement Currency Service

In `apps/currencies/services.py`:

```python
import requests
from django.core.cache import cache

def fetch_exchange_rate(from_currency, to_currency):
    # Call external API with caching
    pass

def convert_currency(amount, from_currency, to_currency):
    # Returns converted amount + metadata
    pass
```

### 6. Implement OCR Service

In `apps/ocr/services.py`:

```python
import pytesseract
from PIL import Image

def process_receipt(image_file):
    # Extract text using Tesseract
    # Parse amount, date, merchant
    # Return structured data
    pass
```

### 7. Implement Authentication Views

In `apps/authentication/views.py`:

```python
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class SignupView(APIView):
    permission_classes = []
    
    def post(self, request):
        # 1. Create Company
        # 2. Fetch currency data
        # 3. Create admin user
        # 4. Return JWT tokens
        pass
```

## 🧪 Testing

```bash
# Run tests
python manage.py test

# Create test data
python manage.py loaddata fixtures/test_data.json
```

## 📦 Seed Data

Create seed data in `fixtures/seed_data.json`:

```json
[
  {
    "model": "companies.company",
    "pk": 1,
    "fields": {
      "name": "Acme Corporation",
      "country": "United States",
      "base_currency_code": "USD",
      "base_currency_symbol": "$"
    }
  }
]
```

Load with:
```bash
python manage.py loaddata fixtures/seed_data.json
```

## 🔐 Permissions

Create custom permissions in `core/permissions.py`:

```python
from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsApprover(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if user is assigned as approver
        pass
```

## 📊 Database Indexes

Already defined in models for optimal performance:
- User + Status lookups
- Company + Status lookups
- Submission date queries
- Approver + Status queries

## 🚨 Error Handling

Implement consistent error responses:

```python
from rest_framework.exceptions import APIException

class WorkflowError(APIException):
    status_code = 400
    default_detail = 'Workflow execution error'
```

## 📝 Documentation

Once implemented, generate API documentation:

```bash
# Install drf-spectacular
pip install drf-spectacular

# Add to INSTALLED_APPS
# Generate schema
python manage.py spectacular --file schema.yml
```

## 🎯 Critical Implementation Priority

1. **Authentication** (signup/login) - Foundation
2. **Company & User Management** - Required for everything
3. **Currency Service** - Needed for expense submission
4. **Expense CRUD** - Core functionality
5. **Rule Engine** - Business logic core
6. **Workflow Engine** - Approval orchestration
7. **Approval Actions** - User interactions
8. **Audit Logging** - Compliance
9. **OCR Processing** - UX enhancement
10. **Dashboard APIs** - Analytics

## 🔗 External APIs Integration

### REST Countries API
```python
def fetch_currency_data(country):
    url = f"https://restcountries.com/v3.1/name/{country}"
    response = requests.get(url)
    # Parse and cache
```

### ExchangeRate API
```python
def get_exchange_rate(base, target):
    url = f"https://api.exchangerate-api.com/v4/latest/{base}"
    # Cache for 24 hours
```

## 📖 Additional Resources

- Django REST Framework: https://www.django-rest-framework.org/
- Simple JWT: https://django-rest-framework-simplejwt.readthedocs.io/
- PostgreSQL: https://www.postgresql.org/docs/
- Tesseract OCR: https://github.com/tesseract-ocr/tesseract

## 🤝 Contributing

1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Submit pull request

---

**Status**: ✅ Database models complete, ready for API implementation
