from rest_framework import serializers


class ReceiptParseSerializer(serializers.Serializer):
    merchant = serializers.CharField(required=False, allow_blank=True)
    amount = serializers.CharField(required=False, allow_blank=True)
    date = serializers.CharField(required=False, allow_blank=True)
    confidence = serializers.FloatField(required=False)
    raw_text = serializers.CharField(required=False, allow_blank=True)
