import urllib.request
import urllib.parse
import ssl
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, data=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    if data:
        encoded = urllib.parse.urlencode(data).encode('utf-8')
        req.data = encoded
    with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
        return resp.read().decode('utf-8', errors='ignore')

# 1. Inspect all markets in AMPIS market-price-comparison
ampis_comp = fetch("https://ampis.gov.np/market-price-comparison")
ampis_tables = re.findall(r'<table[^>]*>(.*?)</table>', ampis_comp, re.DOTALL)
print(f"Total AMPIS tables: {len(ampis_tables)}")
markets_found = set()
for i, tbl in enumerate(ampis_tables):
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tbl, re.DOTALL)
    if len(rows) > 1:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', rows[1], re.DOTALL)]
        if cols:
            market_name = cols[0]
            markets_found.add(market_name)
            print(f"  Table {i} Market: {market_name} (rows: {len(rows)})")
print("Markets found in AMPIS:", list(markets_found))

# 2. Check Kalimati daily-arrivals POST
try:
    arr_page = fetch("https://kalimatimarket.gov.np/daily-arrivals")
    csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', arr_page)
    csrf = csrf_match.group(1) if csrf_match else ""
    print(f"\nKalimati CSRF: {csrf}")
    # Try fetching arrivals for date
    post_data = {"_token": csrf, "datePricing": "2026-09-25"}
    arr_resp = fetch("https://kalimatimarket.gov.np/daily-arrivals", data=post_data)
    arr_tables = re.findall(r'<table[^>]*>(.*?)</table>', arr_resp, re.DOTALL)
    print(f"Kalimati arrivals tables after post: {len(arr_tables)}")
    if arr_tables:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', arr_tables[0], re.DOTALL)
        print(f"Kalimati arrival rows: {len(rows)}")
        for r in rows[:6]:
            cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
            print("  Arrival row:", cols)
except Exception as e:
    print("Arrival post error:", e)
