# Retail Banking Customer Retention & Portfolio Risk Analytics Platform

-----------------------------

`Name : Intikhab Ahmad Shah`

`Trainee ID : TRN-2026-000059`

`Trainer : Respected. Maam Mahnoor Salman`

`Venue : Iqra University - IU, Islamabad`
______________________________

## 📌 Executive Overview
This is a dedicated, production-grade Customer Retention & Portfolio Risk Analytics Platform engineered for retail banking institutions. Built to evaluate customer attrition across 10,000 banking accounts and €764M+ in assets under management, the platform combines interactive portfolio diagnostics, dynamic multi-variable cross-filtering, and an inferencing engine for real-time customer churn probability scoring.

---

## 🎨 Visual Design & Interaction Architecture
- **Strict Light Mode Palette:** Clean Off-White background (`#F8FAFC`), crisp white analytical cards (`#FFFFFF`), subtle slate borders (`#E2E8F0`), and executive blue accents (`#1D4ED8`).
- **Typography:** Google Fonts **Poppins** across all headers, cards, tables, and metric displays.
- **Ambient Kinetic Atmosphere:** A canvas particle stream gently drifting downward with soft windy physics. As users navigate the cursor, particles dynamically react and disperse with fluid spring physics.
- **Micro-Interactions:** Smooth GSAP staggered entrances, tab transitions, and animated score reveals.
- **Interactive Visualizations:** Fully responsive dynamic Chart.js charts with real-time tooltips, active legends, and hover states.
- **Standardized Nomenclature:** 100% heuristics-approved executive banking terminology throughout the UI.

---

## ⚡ Core Platform Capabilities

1. **Executive Summary & Portfolio Health:**
   - 4 Macro-level KPI metric cards: Total Customers (10,000), Attrition Rate (20.37%), Retention Rate (79.63%), and At-Risk Asset Value (€185.6M).
   - Portfolio Retention Distribution Donut Chart and Regional Attrition Concentrations.

2. **Regional & Demographic Attrition Analysis:**
   - Cross-sectional breakdowns across France, Germany, and Spain.
   - Generational age density distributions and gender retention comparisons.

3. **Product Depth & Asset Concentration:**
   - Visualizing the **"2-Product Sweet Spot"** (7.58% churn vs 27.71% for single-product holders and >82% for 3+ products).
   - Deposit balance tiers and cardholder correlations.

4. **Real-Time Churn Risk Evaluator (Live Scoring Engine):**
   - Single-customer parameter evaluation (Credit score, Country, Gender, Age, Tenure, Balance, Products, Activity, Salary).
   - Interactive Decision Threshold slider (0.30 to 0.70) with dynamic recalculation.
   - Quick preset scenarios (Loyal Client, At-Risk German Client, Inactive Middle-Aged Client).
   - Probability progress indicator, risk tier classification badge, and tailored retention recommendations.

5. **Customer Portfolio Explorer:**
   - Full searchable directory with instant search across IDs, Surnames, and Countries.
   - Multi-attribute filters: Operating Country, Product Count, Membership Activity, and Churn Status.
   - Server-side and client-side paginated table with status badges.

6. **Strategic Retention Advisory:**
   - 4 high-impact, empirical banking strategies structured with empirical findings, target audiences, and actionable implementation guidelines.

---

## 🚀 Local Execution & Vercel Deployment

### 1. Run Locally:
Double-click **`Run_Dashboard.bat`** or run:
```bash
npm start
```
Access the platform at: `http://localhost:3000`.

### 2. Deploy to Vercel:
The project is configured out-of-the-box for **Vercel Serverless Deployment**:
- `vercel.json` rewrites all requests to the serverless handler in `api/index.js`.
- Root directory: `dashboard/`
- Command to deploy via Vercel CLI:
  ```bash
  vercel
  ```
- Or link the `dashboard/` folder to your GitHub repository and import it directly into Vercel Dashboard!

---

## 📁 Dashboard Structure
```text
dashboard/
├── api/
│   └── index.js                 # Vercel Serverless API handler
├── public/
│   ├── index.html               # Main Dashboard application UI
│   ├── styles.css               # Clean Light Mode styling (Poppins font)
│   ├── app.js                   # Application controller, Three.js & Chart.js logic
│   └── vendor/                  # Offline vendor assets (Chart.js, GSAP, Three.js, FontAwesome)
├── churn_dashboard_data.json    # Pre-computed analytics dataset
├── Churn_Modelling.csv          # 10,000 customer CSV records
├── package.json                 # Node.js dependencies
├── vercel.json                  # Vercel deployment configuration
├── server.js                    # Express local development server
├── predict.py                   # Python machine learning inference bridge
├── prepare_dashboard_data.py    # Analytics compilation script
├── Run_Dashboard.bat            # One-click Windows launcher
└── README.md                    # Documentation
```
