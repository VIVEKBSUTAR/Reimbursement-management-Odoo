"""
Seed script for demo data
Run with: python manage.py shell < seed_demo_data.py
"""

from apps.companies.models import Company
from apps.users.models import User, ReportingStructure
from apps.rules.models import Rule
from decimal import Decimal

print("🌱 Seeding demo data...")

# Create company
company, created = Company.objects.get_or_create(
    name="TechCorp Inc",
    defaults={
        'country': 'United States',
        'base_currency_code': 'USD',
        'base_currency_symbol': '$'
    }
)
print(f"✅ Company: {company.name}")

# Create users
admin, created = User.objects.get_or_create(
    email="admin@techcorp.com",
    defaults={
        'first_name': 'Admin',
        'last_name': 'User',
        'company': company,
        'role': 'admin'
    }
)
if created:
    admin.set_password('admin123')
    admin.save()
print(f"✅ Admin: {admin.email} (password: admin123)")

manager, created = User.objects.get_or_create(
    email="manager@techcorp.com",
    defaults={
        'first_name': 'Manager',
        'last_name': 'User',
        'company': company,
        'role': 'manager'
    }
)
if created:
    manager.set_password('manager123')
    manager.save()
print(f"✅ Manager: {manager.email} (password: manager123)")

employee, created = User.objects.get_or_create(
    email="employee@techcorp.com",
    defaults={
        'first_name': 'Employee',
        'last_name': 'User',
        'company': company,
        'role': 'employee'
    }
)
if created:
    employee.set_password('employee123')
    employee.save()
print(f"✅ Employee: {employee.email} (password: employee123)")

# Create reporting structure
from datetime import date
ReportingStructure.objects.get_or_create(
    employee=employee,
    manager=manager,
    defaults={'effective_from': date.today()}
)
print(f"✅ Reporting: {employee.first_name} reports to {manager.first_name}")

# Create rules
rule1, created = Rule.objects.get_or_create(
    name="Manager Approval for All",
    company=company,
    defaults={
        'description': 'All expenses require manager approval',
        'condition_type': 'AMOUNT',
        'condition_config': {'operator': '>=', 'value': '0'},
        'action_config': {
            'action_type': 'ADD_MANAGER',
            'rule_type': 'ALL'
        },
        'priority': 10,
        'is_active': True
    }
)
print(f"✅ Rule 1: {rule1.name}")

rule2, created = Rule.objects.get_or_create(
    name="Admin Approval for High Amount",
    company=company,
    defaults={
        'description': 'Expenses over $10,000 require admin approval',
        'condition_type': 'AMOUNT',
        'condition_config': {'operator': '>', 'value': '10000'},
        'action_config': {
            'action_type': 'ADD_ROLE',
            'target_role': 'admin',
            'rule_type': 'ALL'
        },
        'priority': 20,
        'is_active': True
    }
)
print(f"✅ Rule 2: {rule2.name}")

rule3, created = Rule.objects.get_or_create(
    name="Manager Approval for Travel",
    company=company,
    defaults={
        'description': 'Travel expenses require manager approval',
        'condition_type': 'CATEGORY',
        'condition_config': {'categories': ['travel']},
        'action_config': {
            'action_type': 'ADD_MANAGER',
            'rule_type': 'ALL'
        },
        'priority': 15,
        'is_active': True
    }
)
print(f"✅ Rule 3: {rule3.name}")

print("\n🎉 Demo data seeded successfully!")
print("\n📝 Next steps:")
print("1. Login to Django admin: http://localhost:8000/admin")
print("2. Use these credentials to test APIs:")
print("   - Admin: admin@techcorp.com / admin123")
print("   - Manager: manager@techcorp.com / manager123")
print("   - Employee: employee@techcorp.com / employee123")
