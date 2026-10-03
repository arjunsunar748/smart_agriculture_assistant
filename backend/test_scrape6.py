import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}
client = httpx.Client(headers=headers, verify=False, timeout=15.0, follow_redirects=True)

for path in ['/available-commodity', '/technical-note', '/market-price/6116a0f3-3f3a-46e2-9f02-6647fab7366e']:
    url = f"https://ampis.gov.np{path}"
    try:
        r = client.get(url)
        print(f"\n--- {url} (status: {r.status_code}, len: {len(r.text)}) ---")
        # Check title or h1
        h1 = re.findall(r'<h[1-2][^>]*>(.*?)</h[1-2]>', r.text, re.DOTALL)
        print("Headings:", [re.sub(r'<[^>]+>', '', h).strip() for h in h1[:4]])
        # Check tables or form controls
        selects = re.findall(r'<select[^>]*name=["\']([^"\']+)["\']', r.text)
        print("Select elements:", selects)
        tables = re.findall(r'<table[^>]*>(.*?)</table>', r.text, re.DOTALL)
        print("Tables count:", len(tables))
        if tables:
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
            print(f"Table 0 rows: {len(rows)}")
            for row in rows[:3]:
                cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', row, re.DOTALL)]
                print("  Row:", cols)
    except Exception as e:
        print(f"Error {path}:", e)
