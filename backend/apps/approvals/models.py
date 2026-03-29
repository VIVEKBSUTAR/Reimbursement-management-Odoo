"""
Approval workflow models
"""
from django.db import models
from django.conf import settings


class ApprovalFlow(models.Model):
    """Approval workflow instance for an expense"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated'),
    ]
    
    expense = models.OneToOneField('expenses.Expense', on_delete=models.CASCADE, related_name='approval_flow')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'approval_flows'
    
    def __str__(self):
        return f"Flow for Expense {self.expense.id}"


class ApprovalStep(models.Model):
    """Individual steps in an approval workflow"""
    
    RULE_TYPE_CHOICES = [
        ('ALL', 'All Approvers Must Approve'),
        ('PERCENTAGE', 'Percentage Threshold'),
        ('SPECIFIC_APPROVER', 'Specific Approver'),
        ('HYBRID', 'Hybrid Logic'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    flow = models.ForeignKey(ApprovalFlow, on_delete=models.CASCADE, related_name='steps')
    sequence_order = models.IntegerField()
    rule_type = models.CharField(max_length=20, choices=RULE_TYPE_CHOICES)
    threshold_percentage = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rule_name = models.CharField(max_length=255, blank=True)  # For audit trail
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'approval_steps'
        ordering = ['sequence_order']
        unique_together = ['flow', 'sequence_order']
    
    def __str__(self):
        return f"Step {self.sequence_order} - {self.rule_type}"


class Approver(models.Model):
    """Individual approvers for a step"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    step = models.ForeignKey(ApprovalStep, on_delete=models.CASCADE, related_name='approvers')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='approvals')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    comments = models.TextField(blank=True)
    action_timestamp = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'approvers'
        unique_together = ['step', 'user']
        indexes = [
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.status}"
