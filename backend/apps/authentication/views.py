from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import SignupSerializer, LoginSerializer, UserSerializer


class SignupView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Company and admin user created successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
            
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
