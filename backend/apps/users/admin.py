from django.contrib import admin
from .models import User, ReportingStructure

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'company', 'is_active']
    list_filter = ['role', 'is_active', 'company']
    search_fields = ['email', 'first_name', 'last_name']

@admin.register(ReportingStructure)
class ReportingStructureAdmin(admin.ModelAdmin):
    list_display = ['employee', 'manager', 'effective_from', 'effective_to']
    list_filter = ['effective_from', 'effective_to']
