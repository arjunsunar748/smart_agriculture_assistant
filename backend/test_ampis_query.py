import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

client = httpx.Client(headers={'User-Agent': 'Mozilla/5.0'}, verify=False, timeout=15.0)

# Test query for Butwal (uid 11) for current year 2083 (1614822) month 38 (Ashoj)
url = "https://ampis.gov.np/market-price-comparison"
params = {
    "uid_entityreference_filter": "11", # Butwal
    "field_market_rate_year_target_id_entityreference_filter": "1614822",
    "field_market_rate_month_target_id": "38", # Ashoj
    "field_market_rate_day_target_id": "All"
}

resp = client.get(url, params=params)
print(f"Status: {resp.status_code}, URL: {resp.url}")
tables = re.findall(r'<table[^>]*>(.*?)</table>', resp.text, re.DOTALL)
print(f"Tables found: {len(tables)}")
if tables:
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
    print(f"Rows count: {len(rows)}")
    for r in rows[:8]:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
        print("  ", cols)
