# 🌱 Off-Season Smart Agriculture Assistant

An autonomous, AI-powered agricultural decision-support web application engineered to answer:
> **"If I plant this vegetable now, when will I harvest it, what will the market probably look like at harvest time, and is it worth growing it in a tunnel?"**
> *(अहिले यो तरकारी रोपे कहिले फसल तयार हुन्छ, त्यो बेला बजार भाउ कस्तो होला र के टनेलमा लगाउन फाइदाजनक छ?)*

---

## 🎯 Core Product Philosophy
The purpose of this system is **NOT** simply to recommend vegetables that can be planted in the current season.

The main objective is:
> **Identify vegetables that can be cultivated NOW in a tunnel/controlled environment and harvested during a future period when market demand is expected to be high and supply may be relatively low, creating an opportunity for better selling prices and profit.**

### The Golden Rule:
# **PLANT NOW → HARVEST AT THE RIGHT TIME → TARGET A BETTER MARKET WINDOW**

The application does NOT make false promises or tell farmers:
> *"Plant X and you will definitely make money."*

Instead, it presents grounded, transparent probabilities:
> *"Historical seasonal opportunity detected. Historical market and agricultural data indicate that X may have a stronger market opportunity during the expected harvest period. Here are the price, cost, yield, and risk scenarios."*

---

## ⚡ Zero IoT Architecture — 100% Online Telemetry
**This application operates completely without physical hardware or sensors.**
* ❌ **NO ESP32 / Arduino**
* ❌ **NO MQTT brokers or microcontrollers**
* ❌ **NO physical ground sensor dependencies**

Instead, the system correlates:
1. **Real-Time Atmospheric Metrics**: Live Open-Meteo Global Meteorological API (hourly temperature, relative humidity %, rainfall, wind, 15-day forecast, elevation profiles).
2. **Wholesale Mandi Arbitrage Telemetry**: Kalimati Fruit and Vegetable Market Development Board daily commodity arrivals, price spreads (min/max/average in NPR/kg), 5-year monthly seasonal curves, and volume arrival contractions.
3. **Phenological & Microclimate GDD Models**: Base temperature thresholds ($T_{base}$), thermal buffering offsets ($+5^\circ\text{C}$ to $+8^\circ\text{C}$ daytime solar gain, $+2^\circ\text{C}$ to $+3^\circ\text{C}$ nighttime heat retention), rain exclusion benefits, and humidity management.
4. **Machine Learning Price Forecasting & Seasonality**: Scikit-Learn regression models, residual standard deviations, and historical volume arrival indexes ($Index < 60$ indicates severe supply contraction).

---

## 🌟 Core Decision Engines & Features

### 1. 🌱 Flagship Engine: "What Should I Plant NOW for Future High-Value Harvest?"
* Enter location, tunnel size (with instant $\text{m}^2 \leftrightarrow \text{sq.ft}$ conversion), budget (NPR), and current/planting date.
* **Core Visual Timeline**:
  $$\text{NOW} \longrightarrow \text{Plant Seeds} \longrightarrow \text{Growing Period (Tunnel Buffer)} \longrightarrow \text{Expected Harvest Window} \longrightarrow \text{High-Value Market Gap}$$
* **Transparent Configurable Scoring Weights**:
  * Off-season price opportunity: **30%**
  * Harvest timing suitability: **20%**
  * Tunnel suitability: **20%**
  * Expected profit & ROI: **15%**
  * Market demand & scarcity: **10%**
  * Weather risk factor: **5%**
* **3 Financial Scenarios**:
  * *Conservative Scenario*: Reflects cross-border supply influx or regional surplus (-18%).
  * *Normal Scenario*: 5-year historical Kalimati Mandi harvest window average.
  * *High Price Scenario*: Reflects severe open-field frost failure and festive market demand (+25%).
* **Itemized & Live-Editable Production Costs**:
  * Seeds/Seedlings, Fertilizer, Pesticides, Labor, Water/Electricity, Tunnel Prep/Maintenance, Transport/Packaging, Miscellaneous.

### 2. 🔄 Reverse Crop Planning (Backward Crop Planning)
* Reverses conventional crop calendars:
  $$\text{Future High-Value Target Month} \longrightarrow \text{Expected Harvest Date} \longrightarrow \text{Subtract Growing Duration} \longrightarrow \text{Recommended Planting Date Window}$$
* Categorizes all 17 supported crops:
  * 🟢 **ACTIVE WINDOW (Plant Now!)**: Target harvest aligns if seeded today.
  * 🟡 **Upcoming Window (Seed in X days)**: Planting window approaching.
  * 🔴 **Window Passed for Selected Target Month**: Too late to mature for target month.
* Verifies tunnel feasibility with specific agronomic justifications.

### 3. 📅 12-Month Future Market Windows Calendar
* Interactive matrix across all 12 months (Gregorian & Bikram Sambat) color-coding market opportunities:
  * 🟢 **High Off-Season Opportunity** ($Price \ge +50\%$ over glut, Scarcity Index $< 70$).
  * 🟡 **Moderate Window** ($Price \ge +25\%$ over glut).
  * ⚪ **Main Season Glut / Low Margin**.
* Click-through modal for deep-dive inspection into required planting dates, arrival contractions, and scenarios.

### 4. 📈 Historical Price Seasonality & Market Scarcity Intelligence
* Dual-axis interactive Recharts: Historical Wholesale Price (NPR/kg) and Mandi Arrival Volume Index ($100 = \text{base average}$).
* Glut window vs. Peak scarcity window breakdown.
* Detailed Market Gap thesis explaining why outdoor production ceases and tunnels capture premiums.

### 5. 💰 "What If?" Sensitivity Simulator
* Real-time stress testing with interactive sliders:
  * Crop selector
  * Tunnel size ($\text{m}^2$ / sq.ft)
  * Selling Price adjustment ($-40\%$ to $+40\%$)
  * Expected Yield adjustment ($-50\%$ to $+50\%$)
  * Production Cost adjustment ($-30\%$ to $+50\%$)
* Dynamic recalculation of:
  * Harvest date & target month
  * Gross revenue, net profit, ROI %
  * Profit delta ($\pm \text{NPR}$)
  * **Break-Even Price** (NPR/kg) & **Break-Even Yield** (kg)
  * Qualitative resilience verdict and risk classification.

### 6. ⚖️ Off-Season Crop Comparison
* Side-by-side comparative matrix of 2 to 4 crops.
* Impartial evaluation of harvest dates, duration, price range, tunnel suitability, yield, costs, profit scenarios, and market risk without declaring a biased universal winner.

### 7. 🤖 Context-Grounded AI Agriculture Chatbot
* Ingests actual application data before responding (Zero Hallucination).
* Fluent in English, Nepali, and Romanized Nepali.
* Handles benchmark farmer queries:
  * *"Aile tomato lagaye December ma kasto price huna sakcha?"*
  * *"September ma kun vegetable lagayera December ma bechda ramro market pauna sakiyela?"*
  * *"Mero 1000 sq.ft tunnel xa, kun crop consider garum?"*
  * *"Cucumber ra tomato madhye kunko harvest time market gap sanga better match huncha?"*
  * *"Price 30% ghate bhane profit kati huncha?"*

---

## 🇳🇵 Nepal Localization
* **Bilingual UI**: Seamless instant toggle between **नेपाली** and **English**.
* **Currency**: Nepalese Rupee (NPR / रु).
* **Land Units**: Square Meters ($\text{m}^2$), Square Feet (sq.ft), Ropani ($508.7\,\text{m}^2$), Aana ($31.8\,\text{m}^2$), Bigha ($6,772.6\,\text{m}^2$), Kattha.
* **Geographic Coverage**: 7 Provinces, 77 Districts with coordinates, elevation profiles, and municipal centers.

---

## 🚀 Running the Application

### 1. Backend (FastAPI + SQLAlchemy)
The backend runs in `backend/`:
```powershell
cd "backend"
.\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
```
* **API Documentation (Swagger UI)**: `http://127.0.0.1:8000/docs`
* **Health Check**: `http://127.0.0.1:8000/health`

### 2. Frontend (React + Vite)
The frontend runs with Vite in `frontend/`:
```powershell
cd "frontend"
npx vite --host 127.0.0.1 --port 5173
```
* **Web UI**: `http://127.0.0.1:5173/`

---

## 🔒 Data Reliability & Provenance
* **Kalimati Fruit and Vegetable Market Development Board**: Daily wholesale auction prices, spreads, and seasonal arrival curves.
* **Open-Meteo Global Atmospheric Telemetry**: Real-time hourly temperature, humidity, rainfall, and 15-day GFS forecast.
* **Nepal Agricultural Research Council (NARC)**: Phenological growth stages, base temperatures, and walk-in plastic tunnel recommendations.
* **Offline Notice**: If live feeds are interrupted, the interface displays: *"Live data unavailable. Showing historical data."* Mock data is never called real-time.
