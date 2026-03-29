from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.expenses.models import Expense
from apps.expenses.serializers import ExpenseSerializer, ExpenseCreateSerializer
from apps.approvals.workflow_engine import WorkflowEngine
from apps.audit.models import ApprovalLog


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Expense.objects.filter(company=user.company)
        return Expense.objects.filter(user=user)
    
    def perform_create(self, serializer):
        expense = serializer.save()
        
        # THE MAGIC HAPPENS HERE: Generate workflow
        flow = WorkflowEngine.generate_approval_flow(expense)
        
        # Update expense status
        expense.status = 'IN_PROGRESS'
        expense.save()
        
        # Log submission
        ApprovalLog.objects.create(
            expense=expense,
            action='EXPENSE_SUBMITTED',
            performed_by=self.request.user,
            metadata={'flow_id': flow.id}
        )
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get approval timeline for an expense"""
        expense = self.get_object()
        logs = ApprovalLog.objects.filter(expense=expense).order_by('timestamp')
        
        timeline = []
        for log in logs:
            timeline.append({
                'action': log.action,
                'performed_by': log.performed_by.name if log.performed_by else 'System',
                'timestamp': log.timestamp,
                'metadata': log.metadata
            })
        
        return Response({'timeline': timeline})
