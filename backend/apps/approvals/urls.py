from django.urls import path
from .views import ApprovalViewSet

urlpatterns = [
    path('', ApprovalViewSet.as_view({'get': 'list'}), name='approval-list'),
    path('<int:pk>/approve/', ApprovalViewSet.as_view({'post': 'approve'}), name='approval-approve'),
    path('<int:pk>/reject/', ApprovalViewSet.as_view({'post': 'reject'}), name='approval-reject'),
]
