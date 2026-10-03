import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

r = httpx.get('https://ampis.gov.np/', verify=False)
# Search for dropdowns, links, or mention of markets:
print("Dropdowns in home page:")
selects = re.findall(r'<select[^>]*name=["\']([^"\']+)["\'](.*?)<\/select>', r.text, re.DOTALL)
for name, body in selects:
    print("Select:", name)
    options = re.findall(r'<option[^>]*value=["\']([^"\']+)["\'][^>]*>([^<]+)</option>', body)
    for val, text in options[:10]:
        print(f"   {val} -> {text.strip()}")

# Look for market names mentioned in text
print("\nLook for 'बजार' in home page text:")
paragraphs = re.findall(r'<[^>]+>([^<]*बजार[^<]*)<', r.text)
for p in set(paragraphs):
    if len(p.strip()) > 3:
        print("  -", p.strip())

# Check /market-price-comparison page dropdowns or tables
r2 = httpx.get('https://ampis.gov.np/market-price-comparison', verify=False)
selects2 = re.findall(r'<select[^>]*name=["\']([^"\']+)["\'](.*?)<\/select>', r2.text, re.DOTALL)
for name, body in selects2:
    print("\nComparison Select:", name)
    options = re.findall(r'<option[^>]*value=["\']([^"\']+)["\'][^>]*>([^<]+)</option>', body)
    for val, text in options[:15]:
        print(f"   {val} -> {text.strip()}")
