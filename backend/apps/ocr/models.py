"""
OCR processing models
"""
from django.db import models


class OCRExtraction(models.Model):
    """OCR processing results"""
    expense = models.OneToOneField('expenses.Expense', on_delete=models.CASCADE, related_name='ocr_data')
    receipt_url = models.CharField(max_length=500)
    extracted_data = models.JSONField()  # Stores amount, date, merchant, category
    confidence_score = models.FloatField()
    processed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ocr_extractions'
