import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

client = httpx.Client(headers=headers, verify=False, timeout=15.0, follow_redirects=True)

# 1. Test Kalimati daily-arrivals with session cookies
try:
    r1 = client.get("https://kalimatimarket.gov.np/daily-arrivals")
    csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', r1.text)
    csrf = csrf_match.group(1) if csrf_match else ""
    print(f"Kalimati status: {r1.status_code}, CSRF: {csrf[:10]}...")
    
    # Try POST
    r2 = client.post("https://kalimatimarket.gov.np/daily-arrivals", data={"_token": csrf, "datePricing": "2026-09-25"})
    print(f"Kalimati POST status: {r2.status_code}, len: {len(r2.text)}")
    tables = re.findall(r'<table[^>]*>(.*?)</table>', r2.text, re.DOTALL)
    print(f"Tables in arrival post: {len(tables)}")
    if tables:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tables[0], re.DOTALL)
        print("Arrival rows:", len(rows))
        for r in rows[:6]:
            cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
            print("  Arrival row:", cols)
except Exception as e:
    print("Kalimati error:", e)

# 2. Test AMPIS all links
try:
    r_ampis = client.get("https://ampis.gov.np/")
    print(f"\nAMPIS Home status: {r_ampis.status_code}")
    all_links = set(re.findall(r'href=["\']([^"\']+)["\']', r_ampis.text))
    for l in sorted(all_links):
        if not l.startswith("#") and not l.startswith("javascript") and not l.endswith(".css") and not l.endswith(".png"):
            print("  AMPIS Link:", l)
except Exception as e:
    print("AMPIS home error:", e)
