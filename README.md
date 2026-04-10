# 🔥 ISO Steel Fire Temperature Calculator

**Eurocode EN 1993-1-2 · ISO 834 Standard Fire Curve**

A professional web application that calculates steel temperatures under standard fire exposure — for both **unprotected** and **protected** steel sections — based on the formulas in your Excel workbook.

---

## 📋 What It Does

- Plots the **ISO 834 gas temperature curve** (red)
- Calculates **unprotected steel temperature** over time (green) using Eurocode heat flux equations
- Calculates **protected steel temperature** over time (blue) using Eurocode insulation formula
- Supports **All Sides** and **Three Sides** fire exposure
- Shows computed section properties (area, section factor, shadow factor ksh)
- Provides a **step-by-step formula workings** panel
- Data table with free columns (Time, Tg, Ts unprotected) and premium-locked Ts protected column

---

## 🗂️ Project Structure

```
steel-fire-calc/
├── package.json              ← Root: run both servers together
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── server.js             ← Express REST API server (port 3001)
│   └── calculations.js       ← All Eurocode formulas (ported from Excel)
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js           ← React entry point
        ├── App.js             ← Root component + layout
        ├── index.css          ← Global dark theme styles
        ├── hooks/
        │   └── useCalculator.js    ← State + API call hook
        └── components/
            ├── InputPanel.js       ← Sidebar with all inputs
            ├── SectionDiagram.js   ← SVG I-section diagram with fire arrows
            ├── SectionProps.js     ← Computed section property cards
            ├── TemperatureChart.js ← Recharts line chart (3 curves)
            ├── DataTable.js        ← Free + premium-locked data table
            ├── FormulaWorkings.js  ← Step-by-step working panel
            └── ResultsArea.js      ← Tabbed results container
```

---

## 🚀 Quick Start (Step by Step)

### Prerequisites

Make sure you have these installed:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 18.x | `node --version` |
| npm | ≥ 9.x | `npm --version` |

Download Node.js from: https://nodejs.org/

---

### Step 1 — Clone / Download the Project

If you have git:
```bash
git clone <your-repo-url>
cd steel-fire-calc
```

Or just extract the folder and open a terminal inside `steel-fire-calc/`.

---

### Step 2 — Install All Dependencies

**Option A — Install everything at once (recommended):**
```bash
npm install                          # installs concurrently at root
npm run install:all                  # installs backend + frontend deps
```

**Option B — Install manually:**
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

---

### Step 3 — Run the App

**Option A — Start both together (from root):**
```bash
npm start
```
This uses `concurrently` to launch both servers simultaneously.

**Option B — Start separately (two terminals):**

Terminal 1 (Backend):
```bash
cd backend
npm start
# → Server running on port 3001
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
# → Opens http://localhost:3000 in your browser
```

---

### Step 4 — Use the Calculator

1. Open **http://localhost:3000** in your browser
2. Fill in **Fire Protection Data** (Cp, dp, λp, ρp)
3. Choose **Exposure**: All Sides or Three Sides
4. Enter **I-Section Geometry** (h, b, tw, tf, r1) in mm
5. Click **⚡ Calculate Temperatures**
6. View results in the tabs: **Graph**, **Data Table**, **Formula Workings**

---

## 🧮 Formulas Used (from Excel)

### ISO 834 Gas Temperature
```
Tg(t) = 20 + 345 × log₁₀(8t + 1)     [t in minutes]
```

### Cross-Section Area
```
A = 2(b × tf) + (h − 2tf) × tw + 4(1 − π/4) × r1²
```

### Heated Perimeter
```
All Sides:    Hp = 2h + 4b − 2tw + (2π − 8)r1
Three Sides:  Hp = 2h + 3b − 2tw + (2π − 8)r1
```

### Shadow Factor (ksh)
```
ksh = 0.9 × (Hpb/A) / (Hp/A)     ≤ 1.0
```

### Heat Flux (Unprotected)
```
Qc  = αc × (Tg − Ts)                          [convection, αc = 25 W/m²K]
Qr  = εm × εf × σ × [(Tg+273)⁴ − (Ts+273)⁴]   [radiation, ε = 0.7, σ = 5.67×10⁻⁸]
Qnet = Qc + Qr
```

### Unprotected Steel Temperature Rise (EN 1993-1-2 §4.2.5.1)
```
ΔTs = (ksh × Hp/A) / (ρa × Ca) × Qnet × Δt
```

### Protected Steel Temperature Rise (EN 1993-1-2 §4.3.4.2)
```
φ   = (Cp × ρp × dp × Hp/A) / (Ca × ρa)

ΔTs = [λp × (Hp/A)] / [dp × Ca × ρa × (1 + φ/3)] × (Tg − Ts) × Δt
      − (e^(φ/10) − 1) × ΔTg
```

### Specific Heat of Steel (EN 1993-1-2 §3.4.1)
```
Ts ≤ 600°C:  Ca = 425 + 7.73×10⁻¹Ts − 1.69×10⁻³Ts² + 2.22×10⁻⁶Ts³
600 < Ts ≤ 735:  Ca = 666 − 13002 / (Ts − 738)
735 < Ts ≤ 900:  Ca = 545 + 17820 / (Ts − 731)
900 < Ts ≤ 1200: Ca = 650
```

---

## ⚙️ Configuration

### Change Time Step
In `backend/calculations.js`, line ~14:
```js
TIME_STEP: 5,    // seconds — change to 1 for higher precision (slower)
```

### Change Simulation Duration
```js
TOTAL_TIME: 8250,   // seconds = 137.5 minutes
```

### Enable Premium Features for All Users
In `frontend/src/components/DataTable.js`, change:
```jsx
<DataTable results={results.results} isPremium={false} />
```
to:
```jsx
<DataTable results={results.results} isPremium={true} />
```

### Change API Port
Backend: set `PORT` environment variable or change in `server.js`
Frontend proxy: update `"proxy"` in `frontend/package.json`

---

## 🔧 API Reference

### POST `/api/calculate`

**Request body:**
```json
{
  "Cp": 1200,       // J/kgK — specific heat of fire protection
  "dp": 0.01,       // m — thickness of fire protection
  "lambdaP": 0.174, // W/mK — thermal conductivity of protection
  "rhoP": 430,      // kg/m³ — density of protection material
  "h": 190,         // mm — section height
  "b": 200,         // mm — flange width
  "tw": 6.5,        // mm — web thickness
  "tf": 10,         // mm — flange thickness
  "r1": 18,         // mm — root radius
  "exposure": "All Sides"  // or "Three Sides"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      { "timeSec": 0, "timeMin": 0, "Tg": 20, "Ts_unprot": 20, "Ts_prot": 20 },
      { "timeSec": 5, "timeMin": 0.08, "Tg": 73.4, "Ts_unprot": 20.4, "Ts_prot": 20.0 },
      ...
    ],
    "sectionProps": {
      "A_mm2": 3892,
      "Hp_mm": 1231.4,
      "Hpb_m": 0.78,
      "HpPerA": 316.3,
      "HpbPerA": 200.4,
      "ksh": 0.570,
      "ApV": 316.3
    }
  }
}
```

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm: command not found` | Install Node.js from nodejs.org |
| Port 3001 already in use | `kill -9 $(lsof -t -i:3001)` or change port in server.js |
| Port 3000 already in use | React will ask to use 3001 — press Y, or set `PORT=3002 npm start` |
| CORS error in browser | Make sure backend is running on :3001 |
| `Module not found` errors | Run `npm install` inside the relevant folder |
| Blank chart / no results | Check browser console; ensure backend returned 200 OK |

---

## 📦 Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| express | HTTP server |
| cors | Cross-origin requests |
| nodemon | Auto-restart on file change (dev) |

### Frontend
| Package | Purpose |
|---------|---------|
| react | UI framework |
| recharts | Chart library (open-source, free) |
| react-scripts | CRA build tooling |

---

## 📐 Default Input Values (from Excel)

| Parameter | Default | Source |
|-----------|---------|--------|
| Cp | 1200 J/kgK | Excel D12 |
| dp | 0.01 m | Excel D13 |
| λp | 0.174 W/mK | Excel D14 |
| ρp | 430 kg/m³ | Excel D15 |
| h | 190 mm | Excel D19 |
| b | 200 mm | Excel D20 |
| tw | 6.5 mm | Excel D21 |
| tf | 10 mm | Excel D22 |
| r1 | 18 mm | Excel D23 |

---

## 📚 References

- **EN 1993-1-2**: Eurocode 3 — Design of steel structures — Part 1-2: General rules — Structural fire design
- **EN 1991-1-2**: Eurocode 1 — Actions on structures — Part 1-2: General actions — Actions on structures exposed to fire
- **ISO 834**: Fire resistance tests — Elements of building construction
