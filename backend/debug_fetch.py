import asyncio
import httpx
import re
import datetime
import sys

sys.stdout.reconfigure(encoding='utf-8')
from app.services.market.market_fetcher import DEFAULT_HEADERS

async def debug():
    async with httpx.AsyncClient(headers=DEFAULT_HEADERS, verify=False, timeout=15.0, follow_redirects=True) as client:
        # Test arrivals
        r1 = await client.get('https://kalimatimarket.gov.np/daily-arrivals')
        csrf_match = re.search(r'name="_token"\s+value="([^"]+)"', r1.text)
        csrf = csrf_match.group(1) if csrf_match else ''
        print('Arrivals CSRF:', csrf)
        r2 = await client.post('https://kalimatimarket.gov.np/daily-arrivals', data={'_token': csrf, 'datePricing': '2026-09-25'})
        print('Arrivals POST status:', r2.status_code, 'len:', len(r2.text))
        tbls = re.findall(r'<table[^>]*>(.*?)</table>', r2.text, re.DOTALL)
        print('Arrivals tables:', len(tbls))
        if tbls:
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tbls[0], re.DOTALL)
            print('Arrivals rows:', len(rows))
            for r in rows[:3]:
                cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                print("  row:", cols)

        # Test AMPIS
        r_ampis = await client.get('https://ampis.gov.np/market-price-comparison', params={'uid_entityreference_filter': '6'})
        print('AMPIS Dharan status:', r_ampis.status_code, 'len:', len(r_ampis.text))
        a_tbls = re.findall(r'<table[^>]*>(.*?)</table>', r_ampis.text, re.DOTALL)
        print('AMPIS tables count:', len(a_tbls))
        if a_tbls:
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', a_tbls[0], re.DOTALL)
            print('AMPIS rows:', len(rows))
            for r in rows[:3]:
                cols = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)]
                print("  ampis row:", cols)

asyncio.run(debug())
