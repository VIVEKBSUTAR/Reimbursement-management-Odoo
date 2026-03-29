from django.urls import path
from .views import ProcessReceiptView

urlpatterns = [
    path('process/', ProcessReceiptView.as_view(), name='process-receipt'),
]
