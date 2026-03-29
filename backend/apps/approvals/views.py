from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.approvals.models import Approver, ApprovalFlow
from apps.approvals.serializers import ApproverSerializer, ApprovalFlowSerializer
from apps.approvals.workflow_engine import WorkflowEngine
from apps.audit.models import ApprovalLog
from django.shortcuts import get_object_or_404


class ApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get pending approvals for current user"""
        user = request.user
        pending = Approver.objects.filter(
            user=user,
            status='PENDING'
        ).select_related('step__flow__expense')
        
        approvals = []
        for approver in pending:
            approvals.append({
                'id': approver.id,
                'expense_id': approver.step.flow.expense.id,
                'expense_amount': float(approver.step.flow.expense.converted_amount),
                'expense_category': approver.step.flow.expense.category,
                'submitted_by': approver.step.flow.expense.user.name,
                'step_sequence': approver.step.sequence_order,
                'rule_type': approver.step.rule_type
            })
        
        return Response({'pending_approvals': approvals})
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an expense"""
        approver = get_object_or_404(Approver, pk=pk, user=request.user)
        
        if approver.status != 'PENDING':
            return Response(
                {'error': 'Approval already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approver.status = 'APPROVED'
        approver.comment = request.data.get('comment', '')
        approver.save()
        
        # Log the approval
        ApprovalLog.objects.create(
            expense=approver.step.flow.expense,
            action='APPROVED',
            performed_by=request.user,
            metadata={
                'step_id': approver.step.id,
                'approver_id': approver.id,
                'comment': approver.comment
            }
        )
        
        # Progress the workflow
        WorkflowEngine.progress_workflow(approver.step.flow.expense)
        
        return Response({
            'message': 'Approval recorded',
            'expense_status': approver.step.flow.expense.status
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an expense"""
        approver = get_object_or_404(Approver, pk=pk, user=request.user)
        
        if approver.status != 'PENDING':
            return Response(
                {'error': 'Approval already processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approver.status = 'REJECTED'
        approver.comment = request.data.get('comment', '')
        approver.save()
        
        # Log the rejection
        ApprovalLog.objects.create(
            expense=approver.step.flow.expense,
            action='REJECTED',
            performed_by=request.user,
            metadata={
                'step_id': approver.step.id,
                'approver_id': approver.id,
                'comment': approver.comment
            }
        )
        
        # Progress the workflow (will mark expense as rejected)
        WorkflowEngine.progress_workflow(approver.step.flow.expense)
        
        return Response({
            'message': 'Expense rejected',
            'expense_status': approver.step.flow.expense.status
        })
