import urllib.request
import ssl
import json
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def inspect_all():
    output = {}
    
    # 1. Kalimati
    url_k = "https://kalimatimarket.gov.np/price"
    try:
        req = urllib.request.Request(url_k, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            tables = soup.find_all('table')
            k_data = []
            if tables:
                rows = tables[0].find_all('tr')
                for r in rows[:15]:
                    cols = [td.get_text(strip=True) for td in r.find_all(['th', 'td'])]
                    k_data.append(cols)
            output["kalimati"] = {
                "length": len(html),
                "rows_count": len(tables[0].find_all('tr')) if tables else 0,
                "sample_rows": k_data
            }
    except Exception as e:
        output["kalimati_error"] = str(e)

    # 2. AMPIS
    url_a = "https://ampis.gov.np/"
    try:
        req = urllib.request.Request(url_a, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            tables = soup.find_all('table')
            a_data = []
            for t_idx, t in enumerate(tables):
                t_rows = []
                for r in t.find_all('tr')[:10]:
                    cols = [td.get_text(strip=True) for td in r.find_all(['th', 'td'])]
                    t_rows.append(cols)
                a_data.append({"table_index": t_idx, "rows_count": len(t.find_all('tr')), "sample": t_rows})
            output["ampis"] = {
                "length": len(html),
                "tables": a_data
            }
    except Exception as e:
        output["ampis_error"] = str(e)

    with open("market_inspection_result.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Inspection saved to market_inspection_result.json")

if __name__ == "__main__":
    inspect_all()
