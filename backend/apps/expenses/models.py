"""
Expense models
"""
from django.db import models
from django.conf import settings


class Expense(models.Model):
    """Main expense model"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    CATEGORY_CHOICES = [
        ('travel', 'Travel'),
        ('it_equipment', 'IT Equipment'),
        ('office_supplies', 'Office Supplies'),
        ('food', 'Food & Beverages'),
        ('others', 'Others'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='expenses')
    
    # Original amount (as submitted)
    original_amount = models.DecimalField(max_digits=12, decimal_places=2)
    original_currency = models.CharField(max_length=3)
    
    # Converted amount (in company currency)
    converted_amount = models.DecimalField(max_digits=12, decimal_places=2)
    conversion_rate = models.DecimalField(max_digits=10, decimal_places=6)
    conversion_timestamp = models.DateTimeField()
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    submission_date = models.DateField()
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'expenses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['company', 'status']),
            models.Index(fields=['submission_date']),
        ]
    
    def __str__(self):
        return f"Expense {self.id} - {self.user.full_name} - {self.converted_amount}"


class ExpenseItem(models.Model):
    """Individual items within an expense (for multi-line expenses)"""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'expense_items'
