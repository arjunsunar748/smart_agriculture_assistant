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

print("Fetching Kalimati /price...")
kalimati_price = fetch("https://kalimatimarket.gov.np/price")
tables = re.findall(r'<table[^>]*>(.*?)</table>', kalimati_price, re.DOTALL)
if tables:
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
    print(f"Kalimati /price Table rows: {len(rows)}")
    for r in rows[:10]:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
        print("  Row:", cols)

# Also check date on Kalimati page
date_match = re.search(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|[A-Za-z]+ \d{1,2},? \d{4})', kalimati_price)
print("Kalimati Date match:", date_match.group(0) if date_match else "None")

# Check what other information is in Kalimati price page
h_tags = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', kalimati_price, re.DOTALL)
print("H tags:", [re.sub(r'<[^>]+>', '', h).strip() for h in h_tags[:5]])
