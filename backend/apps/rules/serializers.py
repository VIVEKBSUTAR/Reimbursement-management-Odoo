from rest_framework import serializers
from apps.rules.models import Rule


class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = ['id', 'name', 'description', 'condition_type', 'condition_config',
                 'action_config', 'priority', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
