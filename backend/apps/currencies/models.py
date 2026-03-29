"""
Currency models
"""
from django.db import models


class CurrencyMaster(models.Model):
    """Locally cached currency data from REST Countries API"""
    country = models.CharField(max_length=100)
    currency_code = models.CharField(max_length=3, unique=True)
    currency_name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=5)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'currency_master'
    
    def __str__(self):
        return f"{self.currency_code} - {self.currency_name}"


class ExchangeRateHistory(models.Model):
    """Historical exchange rates for fallback"""
    from_currency = models.CharField(max_length=3)
    to_currency = models.CharField(max_length=3)
    rate = models.DecimalField(max_digits=10, decimal_places=6)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'exchange_rate_history'
        indexes = [
            models.Index(fields=['from_currency', 'to_currency', '-timestamp']),
        ]
