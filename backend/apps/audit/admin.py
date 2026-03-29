from django.contrib import admin
from .models import ApprovalLog

@admin.register(ApprovalLog)
class ApprovalLogAdmin(admin.ModelAdmin):
    list_display = ['expense', 'action', 'user', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['expense__user__email']
    readonly_fields = ['timestamp']
