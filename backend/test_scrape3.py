import urllib.request
import ssl
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
        return resp.read().decode('utf-8', errors='ignore')

# 1. Kalimati daily-arrivals content
arrivals_html = fetch("https://kalimatimarket.gov.np/daily-arrivals")
forms = re.findall(r'<form[^>]*>(.*?)</form>', arrivals_html, re.DOTALL)
print("Kalimati daily-arrivals forms count:", len(forms))
for f in forms:
    print("Form action/inputs:", re.findall(r'<input[^>]*>', f))

# 2. Kalimati price-history
price_hist = fetch("https://kalimatimarket.gov.np/price-history")
print("Kalimati price-history len:", len(price_hist))
hist_forms = re.findall(r'<form[^>]*>(.*?)</form>', price_hist, re.DOTALL)
print("Kalimati price-history forms:", len(hist_forms))
for f in hist_forms:
    print("Price history form inputs:", re.findall(r'name=["\']([^"\']+)["\']', f))

# 3. AMPIS home and market-price-comparison
ampis_comp = fetch("https://ampis.gov.np/market-price-comparison")
print("AMPIS comp len:", len(ampis_comp))
ampis_tables = re.findall(r'<table[^>]*>(.*?)</table>', ampis_comp, re.DOTALL)
print("AMPIS comp tables:", len(ampis_tables))
if ampis_tables:
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', ampis_tables[0], re.DOTALL)
    print("AMPIS Table 0 rows:", len(rows))
    for r in rows[:10]:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
        print("  AMPIS Row:", cols)
