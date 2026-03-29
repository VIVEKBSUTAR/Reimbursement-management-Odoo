from django.contrib import admin
from .models import ApprovalFlow, ApprovalStep, Approver

@admin.register(ApprovalFlow)
class ApprovalFlowAdmin(admin.ModelAdmin):
    list_display = ['id', 'expense', 'created_at']
    search_fields = ['expense__user__email']

@admin.register(ApprovalStep)
class ApprovalStepAdmin(admin.ModelAdmin):
    list_display = ['id', 'flow', 'sequence_order', 'rule_type']
    list_filter = ['rule_type']

@admin.register(Approver)
class ApproverAdmin(admin.ModelAdmin):
    list_display = ['id', 'step', 'user', 'status', 'action_timestamp']
    list_filter = ['status', 'action_timestamp']
    search_fields = ['user__email']
