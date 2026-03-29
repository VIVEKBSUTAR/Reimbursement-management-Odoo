from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import call_ocr_space, parse_ocr_payload
from .serializers import ReceiptParseSerializer


class ProcessReceiptView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        receipt = request.FILES.get('receipt')
        if not receipt:
            return Response({'detail': 'Receipt image is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ocr_payload = call_ocr_space(receipt)
        except Exception as exc:
            return Response(
                {'detail': 'OCR service error.', 'error': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        parsed_data = parse_ocr_payload(ocr_payload)
        serializer = ReceiptParseSerializer(data=parsed_data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
