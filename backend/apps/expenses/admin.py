from django.contrib import admin
from .models import Expense, ExpenseItem

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'category', 'converted_amount', 'status', 'submission_date']
    list_filter = ['status', 'category', 'submission_date']
    search_fields = ['user__name', 'description']
    readonly_fields = ['converted_amount', 'conversion_rate', 'conversion_timestamp']

@admin.register(ExpenseItem)
class ExpenseItemAdmin(admin.ModelAdmin):
    list_display = ['expense', 'description', 'amount', 'category']
