"""
Rule models for dynamic approval flow generation
"""
from django.db import models
from django.conf import settings


class Rule(models.Model):
    """Business rules for approval workflow generation"""
    
    CONDITION_TYPE_CHOICES = [
        ('amount', 'Amount-based'),
        ('category', 'Category-based'),
        ('role', 'Role-based'),
        ('combined', 'Combined Conditions'),
    ]
    
    ACTION_TYPE_CHOICES = [
        ('add_step', 'Add Approval Step'),
        ('override', 'Override Approval'),
        ('auto_approve', 'Auto Approve'),
    ]
    
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='rules')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    condition_type = models.CharField(max_length=20, choices=CONDITION_TYPE_CHOICES)
    condition_config = models.JSONField()  # Stores condition details
    
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES)
    action_config = models.JSONField()  # Stores action details
    
    priority = models.IntegerField(default=0)  # Higher = evaluated first
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rules'
        ordering = ['-priority', 'id']
        indexes = [
            models.Index(fields=['company', 'is_active', '-priority']),
        ]
    
    def __str__(self):
        return f"{self.name} (Priority: {self.priority})"
