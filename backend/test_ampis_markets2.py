import httpx
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
client = httpx.Client(headers={'User-Agent': 'Mozilla/5.0'}, verify=False, timeout=15.0)

# Check what default page has:
resp = client.get("https://ampis.gov.np/market-price-comparison")
# find what options were selected by default:
selected_opts = re.findall(r'<option[^>]*selected[^>]*value=["\']([^"\']*)["\'][^>]*>([^<]+)</option>', resp.text)
print("Default selected options:", selected_opts)

# Test with Dharan (uid 6)
p1 = {"uid_entityreference_filter": "6"}
r1 = client.get("https://ampis.gov.np/market-price-comparison", params=p1)
t1 = re.findall(r'<table[^>]*>(.*?)</table>', r1.text, re.DOTALL)
print(f"uid=6 alone -> tables: {len(t1)}")

# Test with Kalimati (uid 23)
p2 = {"uid_entityreference_filter": "23"}
r2 = client.get("https://ampis.gov.np/market-price-comparison", params=p2)
t2 = re.findall(r'<table[^>]*>(.*?)</table>', r2.text, re.DOTALL)
print(f"uid=23 alone -> tables: {len(t2)}")
if t2:
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t2[0], re.DOTALL)
    print("Kalimati AMPIS rows:", len(rows))
    for r in rows[:3]:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
        print("  ", cols)

# Test with Kohalpur (uid 12)
p3 = {"uid_entityreference_filter": "12"}
r3 = client.get("https://ampis.gov.np/market-price-comparison", params=p3)
t3 = re.findall(r'<table[^>]*>(.*?)</table>', r3.text, re.DOTALL)
print(f"uid=12 (Kohalpur) -> tables: {len(t3)}")
if t3:
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t3[0], re.DOTALL)
    print("Kohalpur AMPIS rows:", len(rows))
    for r in rows[:3]:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
        print("  ", cols)

# Test with Pokhara (uid 10)
p4 = {"uid_entityreference_filter": "10"}
r4 = client.get("https://ampis.gov.np/market-price-comparison", params=p4)
t4 = re.findall(r'<table[^>]*>(.*?)</table>', r4.text, re.DOTALL)
print(f"uid=10 (Pokhara) -> tables: {len(t4)}")
if t4:
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t4[0], re.DOTALL)
    print("Pokhara AMPIS rows:", len(rows))
    for r in rows[:3]:
        cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
        print("  ", cols)
