from rest_framework import serializers
from apps.users.models import User
from apps.companies.models import Company
from django.contrib.auth.password_validation import validate_password


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'country', 'base_currency_code', 'base_currency_symbol']
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'company', 'is_active']
        read_only_fields = ['id']


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    name = serializers.CharField(max_length=255)
    company_name = serializers.CharField(max_length=255)
    country = serializers.CharField(max_length=100, default='United States')
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def create(self, validated_data):
        company = Company.objects.create(
            name=validated_data['company_name'],
            country=validated_data.get('country', 'United States'),
            base_currency_code='USD',
            base_currency_symbol='$'
        )
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            company=company,
            role='admin'
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
