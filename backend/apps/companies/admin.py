from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'base_currency_code']
    search_fields = ['name', 'country']
