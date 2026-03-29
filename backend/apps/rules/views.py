from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.rules.models import Rule
from apps.rules.serializers import RuleSerializer


class RuleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RuleSerializer
    
    def get_queryset(self):
        return Rule.objects.filter(company=self.request.user.company)
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
