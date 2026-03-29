from rest_framework import serializers
from apps.expenses.models import Expense, ExpenseItem
from apps.authentication.serializers import UserSerializer
from decimal import Decimal


class ExpenseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseItem
        fields = ['id', 'description', 'amount', 'category']


class ExpenseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = ExpenseItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'user', 'company', 'original_amount', 'original_currency',
            'converted_amount', 'conversion_rate', 'conversion_timestamp',
            'category', 'description', 'submission_date', 'status',
            'receipt_image', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'company', 'converted_amount', 
                           'conversion_rate', 'conversion_timestamp', 'status',
                           'submission_date', 'created_at', 'updated_at']


class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['original_amount', 'original_currency', 'category', 'description', 'receipt_image']
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        # For hackathon: Simple conversion (in production, call real API)
        conversion_rate = Decimal('1.0')  # Assume USD
        converted_amount = validated_data['original_amount'] * conversion_rate
        
        expense = Expense.objects.create(
            user=user,
            company=user.company,
            original_amount=validated_data['original_amount'],
            original_currency=validated_data.get('original_currency', 'USD'),
            converted_amount=converted_amount,
            conversion_rate=conversion_rate,
            category=validated_data['category'],
            description=validated_data.get('description', ''),
            receipt_image=validated_data.get('receipt_image'),
            status='PENDING'
        )
        
        return expense
