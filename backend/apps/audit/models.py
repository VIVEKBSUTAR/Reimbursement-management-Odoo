"""
Audit log models
"""
from django.db import models
from django.conf import settings


class ApprovalLog(models.Model):
    """Complete audit trail for all expense actions"""
    
    ACTION_CHOICES = [
        ('created', 'Expense Created'),
        ('submitted', 'Expense Submitted'),
        ('approval_requested', 'Approval Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('escalated', 'Escalated'),
        ('completed', 'Completed'),
    ]
    
    expense = models.ForeignKey('expenses.Expense', on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    comments = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)  # Additional context
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'approval_logs'
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['expense', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.action} - Expense {self.expense.id} by {self.user}"
