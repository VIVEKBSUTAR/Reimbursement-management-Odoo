from django.contrib import admin
from .models import Rule

@admin.register(Rule)
class RuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'condition_type', 'priority', 'is_active']
    list_filter = ['condition_type', 'is_active', 'company']
    search_fields = ['name', 'description']
