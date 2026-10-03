import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = httpx.Client(headers={'User-Agent': 'Mozilla/5.0'}, verify=False, timeout=15.0)
resp = client.get("https://ampis.gov.np/market-price-comparison")

# Look for form tag in comparison page
forms = re.findall(r'<form[^>]*>(.*?)</form>', resp.text, re.DOTALL)
for i, f in enumerate(forms):
    action = re.search(r'action=["\']([^"\']*)["\']', f)
    method = re.search(r'method=["\']([^"\']*)["\']', f)
    print(f"Form {i}: action={action.group(1) if action else ''}, method={method.group(1) if method else 'get'}")
    inputs = re.findall(r'<input[^>]*name=["\']([^"\']+)["\'][^>]*value=["\']([^"\']*)["\']', f)
    print("  Inputs:", inputs)
    selects = re.findall(r'<select[^>]*name=["\']([^"\']+)["\']', f)
    print("  Selects:", selects)
