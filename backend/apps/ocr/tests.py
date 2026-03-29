from django.test import TestCase
from .services import extract_amount, extract_date, extract_merchant


class OCRServiceTests(TestCase):

    def test_extract_amount(self):
        text = 'Total amount: $123.45\nThank you'
        self.assertEqual(extract_amount(text), '123.45')

    def test_extract_date(self):
        text = 'Date: 03/28/2024\nTotal: $50.00'
        self.assertEqual(extract_date(text), '2024-03-28')

    def test_extract_merchant(self):
        text = 'Merchant: Starbucks Coffee\nTotal: $24.50'
        self.assertEqual(extract_merchant(text), 'Starbucks Coffee')
