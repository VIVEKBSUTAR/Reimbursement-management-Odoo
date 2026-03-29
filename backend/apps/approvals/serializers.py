from rest_framework import serializers
from apps.approvals.models import ApprovalFlow, ApprovalStep, Approver
from apps.authentication.serializers import UserSerializer


class ApproverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Approver
        fields = ['id', 'user', 'status', 'comment', 'timestamp']


class ApprovalStepSerializer(serializers.ModelSerializer):
    approvers = ApproverSerializer(many=True, read_only=True)
    
    class Meta:
        model = ApprovalStep
        fields = ['id', 'sequence_order', 'rule_type', 'threshold_percentage', 'approvers']


class ApprovalFlowSerializer(serializers.ModelSerializer):
    steps = ApprovalStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = ApprovalFlow
        fields = ['id', 'expense', 'steps', 'created_at']
