import requests
import re
from datetime import datetime

OCR_SPACE_URL = 'https://api.ocr.space/parse/image'
OCR_SPACE_KEY = 'helloworld'


def extract_amount(text):
    patterns = [
        r'amount[:\s]*\$?\s*([0-9]+(?:[.,][0-9]{2})?)',
        r'total[:\s]*\$?\s*([0-9]+(?:[.,][0-9]{2})?)',
        r'grand total[:\s]*\$?\s*([0-9]+(?:[.,][0-9]{2})?)',
        r'\$([0-9]+(?:[.,][0-9]{2})?)'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return match.group(1).replace(',', '')
    return ''


def extract_date(text):
    patterns = [
        r'([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2})',
        r'([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})',
        r'([A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})'
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            raw_date = match.group(1)
            for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y', '%d/%m/%Y', '%d-%m-%Y', '%B %d, %Y', '%b %d, %Y']:
                try:
                    parsed = datetime.strptime(raw_date, fmt)
                    return parsed.strftime('%Y-%m-%d')
                except ValueError:
                    continue
    return ''


def extract_merchant(text):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines[:5]:
        if re.search(r'(merchant|vendor|store|from|shop|shop name|supplier)[:\-]', line, re.I):
            value = re.split(r'[:\-]', line, maxsplit=1)[-1].strip()
            if value:
                return value
    if lines:
        candidate = lines[0]
        if len(candidate) <= 40:
            return candidate
        if len(lines) > 1:
            return lines[1]
    return ''


def parse_ocr_payload(payload):
    parsed_results = payload.get('ParsedResults')
    if not parsed_results or not isinstance(parsed_results, list):
        return {'merchant': '', 'amount': '', 'date': '', 'confidence': 0.0, 'raw_text': ''}

    result = parsed_results[0]
    ocr_text = result.get('ParsedText', '') or ''
    confidence = result.get('OCRConfidence')
    if confidence is None:
        confidence = result.get('FileParseExitCode', 0)
    if isinstance(confidence, (int, float)) and confidence > 1:
        confidence = min(confidence / 100.0, 1.0)
    else:
        confidence = float(confidence or 0.0)

    merchant = extract_merchant(ocr_text)
    amount = extract_amount(ocr_text)
    date = extract_date(ocr_text)

    return {
        'merchant': merchant,
        'amount': amount,
        'date': date,
        'confidence': confidence,
        'raw_text': ocr_text
    }


def call_ocr_space(file_obj):
    files = {'file': (file_obj.name, file_obj.read())}
    data = {'apikey': OCR_SPACE_KEY, 'language': 'eng', 'isOverlayRequired': False}
    response = requests.post(OCR_SPACE_URL, files=files, data=data, timeout=60)
    response.raise_for_status()
    return response.json()
