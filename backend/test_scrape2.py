import urllib.request
import ssl
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, headers=None):
    hdrs = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, headers=hdrs)
    with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
        return resp.read().decode('utf-8', errors='ignore')

# 1. Check Kalimati English language cookie/header
try:
    req = urllib.request.Request("https://kalimatimarket.gov.np/lang/en", headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
        cookies = resp.headers.get_all('Set-Cookie')
        print("Kalimati Cookies on /lang/en:", cookies)
        # Now fetch with cookie
        cookie_header = "; ".join([c.split(";")[0] for c in cookies]) if cookies else ""
        en_price = fetch("https://kalimatimarket.gov.np/price", headers={'Cookie': cookie_header})
        tables = re.findall(r'<table[^>]*>(.*?)</table>', en_price, re.DOTALL)
        if tables:
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
            print("Kalimati English rows count:", len(rows))
            for r in rows[:5]:
                cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                print("  EN Row:", cols)
except Exception as e:
    print("Kalimati EN error:", e)

# 2. Check Kalimati daily arrivals
try:
    arrivals_html = fetch("https://kalimatimarket.gov.np/daily-arrivals")
    print("\nKalimati daily-arrivals len:", len(arrivals_html))
    tables = re.findall(r'<table[^>]*>(.*?)</table>', arrivals_html, re.DOTALL)
    print("Arrivals tables:", len(tables))
    if tables:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
        print("Arrivals table rows:", len(rows))
        for r in rows[:5]:
            cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
            print("  Arrival Row:", cols)
except Exception as e:
    print("Kalimati arrival error:", e)

# 3. Check AMPIS details
try:
    ampis_home = fetch("https://ampis.gov.np/")
    # Find all script src or inline js
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', ampis_home, re.DOTALL)
    print("\nAMPIS inline scripts count:", len(scripts))
    for s in scripts:
        if 'http' in s or 'api' in s or 'data' in s:
            print("AMPIS script snippet:", s[:200])
    
    # Check script files
    script_srcs = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', ampis_home)
    print("AMPIS script srcs:", script_srcs)
except Exception as e:
    print("AMPIS error:", e)
