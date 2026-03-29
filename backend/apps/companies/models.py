"""
Company model
"""
from django.db import models


class Company(models.Model):
    """Company/Organization model"""
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    base_currency_code = models.CharField(max_length=3)  # USD, EUR, INR
    base_currency_symbol = models.CharField(max_length=5)  # $, €, ₹
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name
