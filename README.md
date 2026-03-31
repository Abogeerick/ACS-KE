# ACS-KE — Alternative Credit Scorer Kenya

> **Safaricom De{c0}de Hackathon 2025 Submission**  
> Solving credit invisibility for 70% of Kenya's adult population using M-Pesa alternative data and Google Gemini AI.

![ACS-KE Banner](https://picsum.photos/seed/acs-ke/1200/400)

---

## The Problem

Over **19 million Kenyan adults** are invisible to traditional credit scoring systems. They have no payslips, no bank statements, and no CRB history — yet they transact daily through M-Pesa, pay their KPLC bills consistently, run businesses via Lipa na M-Pesa tills, and contribute to chamas every Friday.

A bank would call them "unbanked." We call them **underestimated.**

---

## The Solution

ACS-KE is an AI-powered alternative credit scoring platform that analyses the financial behaviour people already have — M-Pesa transaction patterns, utility payment records, and SMS business activity — and translates it into a full credit assessment in under 30 seconds.

No payslip required. No bank account required. No CRB history required.

---

## Live Demo

🌐 **[https://ais-dev-e457ee3brte24vjelqbzdd-290415091687.europe-west1.run.app](https://ais-dev-e457ee3brte24vjelqbzdd-290415091687.europe-west1.run.app)**

Try the pre-loaded demo personas:
- **James** — Uber Driver, Nairobi (Gig Economy)
- **Sarah** — Diaspora Returnee, Nairobi / London (Remittance History)
- **Otieno** — Jua Kali Mechanic, Kamukunji (Irregular but loyal)
- **Grace** — Market trader, Gikomba (Tier B, Near-Prime)
- **David** — Boda boda operator, Kisumu (Tier C, Subprime)
- **Amina** — Seamstress + M-Pesa agent, Mombasa (Tier A, Prime)
- **Peter** — Smallholder Farmer, Eldoret (Seasonal Income)
- **Wanjiru** — Primary Teacher, Nyeri (Salaried + Side Hustle)
- **Hassan** — Matatu Tout, Mombasa (Cash-heavy, low digital footprint)
- **Akinyi** — Mama Mboga, Kisumu (Thin-file, 6 weeks data)

---

## Key Features

### M-Pesa Native Scoring Engine
Understands the full Daraja API transaction taxonomy — P2P sends and receives, Paybill, Buy Goods (Lipa na M-Pesa), B2C salary credits, Airtime purchases, and Fuliza overdraft patterns. Not a generic financial tool adapted for Kenya — built Kenya-first from the ground up.

### Four-Module AI Scoring System
| Module | Weight | What It Measures |
|---|---|---|
| Cashflow Intelligence | 35% | Net flow, income regularity, balance volatility, liquidity buffer, salary-day detection, Fuliza dependency |
| Obligation Fulfilment | 30% | Utility payment regularity, service continuity, obligation-to-income ratio, chama contributions |
| Network & Commercial Activity | 20% | Merchant diversity, business operator detection, paybill category spread, peer network breadth |
| Behavioural Signals | 15% | Airtime proxy income, night transaction patterns, account tenure, channel sophistication |

### Thin-File Protocol
Never declines a first-time applicant with limited data. Instead activates a special assessment mode that uses proxy signals — airtime spend patterns, SMS records, and social trust indicators — to issue a Starter Credit recommendation of KES 500–2,000 as a data-collection mechanism.

### Built-In Bias Correction
Actively detects and corrects for five known biases that would unfairly penalise Kenya's informal economy:

- **Gender bias** — Women managing household cashflow through a spouse's M-Pesa account are protected by weighting obligation fulfilment more heavily
- **Rural penalty** — Lower transaction volumes in rural areas do not mean lower creditworthiness. Rural liquidity benchmarks are adjusted to 0.8× urban
- **Informal economy correction** — Cash-heavy traders (mama mboga, matatu operators) receive a 1.2× income multiplier to reflect the cash-digital split
- **Fuliza parity** — Overdraft usage is treated as a short-term liquidity tool, not a default signal, unless unpaid beyond 14 days or borrowed more than 8 times per month
- **Seasonal correction** — Harvest cycles (Oct–Dec, Apr–May), Ramadan, and school fee months are detected and normalised

### Bilingual Output
Every assessment includes applicant-facing feedback written in both English and Kiswahili, explaining the score in plain language and providing three specific, actionable steps to improve creditworthiness within 90 days. Ends with: *"Thamani yako ya fedha inakua. / Your financial value is growing."*

### Credit Tier System
| Tier | Score Range | Max Limit | Decision |
|---|---|---|---|
| A — Prime | 750–850 | KES 100,000–500,000 | Auto-Approve |
| B — Near-Prime | 620–749 | KES 20,000–100,000 | Approve with Monitoring |
| C — Subprime | 480–619 | KES 2,000–20,000 | Conditional Approval |
| D — Developmental | 300–479 | KES 500–2,000 | Starter Credit |

---

## Tech Stack

### Frontend
- **React 19** with Vite and TypeScript
- **Tailwind CSS** — emerald green and white design system
- **Recharts** — animated credit score gauge and contribution bar charts
- **motion/react** — smooth page transitions
- **Lucide React** — icons
- **clsx** & **tailwind-merge** — utility styling

### Backend
- **Node.js** with Express and TypeScript
- **Google Gemini API** (`@google/genai`) — core AI scoring engine
- **dotenv** — environment variable management
- **tsx** — TypeScript execution for development

---

## Project Structure

```text
/
├── src/
│   ├── services/         # Gemini AI integration logic (gemini.ts)
│   ├── types.ts          # TypeScript interfaces for data models
│   ├── constants.ts      # Demo personas and dashboard stats
│   ├── App.tsx           # Main application UI and logic
│   ├── index.css         # Global styles & Tailwind CSS
│   └── main.tsx          # React entry point
├── index.html            # HTML template
├── metadata.json         # App metadata & permissions
├── package.json          # Dependencies & build scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite build configuration
```

---

## How It Works

```text
Applicant Data Input (Persona or Manual)
        │
        ▼
  React Frontend (App.tsx)
  State management & UI rendering
        │
        ▼
  Gemini Service (src/services/gemini.ts)
  Constructs prompt with:
  - 4-Module Scoring Logic
  - Bias Correction Rules
  - Thin-File Protocol
        │
        ▼
  Google Gemini 3.1 Pro
  Analyzes data and returns 
  structured JSON assessment
        │
        ▼
  React Results Dashboard
  Visualizes score, tier, 
  recommendation & bilingual feedback
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- A Google Gemini API key (get one free at [aistudio.google.com](https://aistudio.google.com))

### Clone the Repository

```bash
git clone https://github.com/abogeerick/acs-ke.git
cd acs-ke
```

### Setup

```bash
npm install
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

Start the application:

```bash
npm run dev
```

The application will be running at `http://localhost:3000`

---

## Why This Matters for Kenya

Kenya's mobile money infrastructure is among the most advanced in the world. M-Pesa processes over **KES 30 trillion annually** and touches more than 30 million active users. Yet the financial data this creates — the transaction history, the utility payments, the business activity — is almost entirely invisible to lenders making credit decisions.

The result is a paradox: Kenya leads the world in mobile money adoption, but the majority of its population remains locked out of formal credit. A boda boda operator who has used M-Pesa faithfully for five years, paid his KPLC bill every month, and contributed to his chama every Friday is a more reliable credit risk than his transaction history would suggest — but no bank can see it.

ACS-KE makes that financial behaviour legible. It bridges the gap between the financial lives people actually live and the credit access they deserve.

---

## Ethical Design Principles

ACS-KE was built with responsible AI principles at its core

- **No contact list scoring** — we do not use phone contact lists, location tracking, or social media activity. These data types violate Kenya's Data Protection Act (2019) and create discriminatory proxies
- **No hard declines** — the minimum score is 300. Every applicant receives either an approval or a starter credit pathway. Credit invisibility ends here
- **Explainability first** — every score comes with a full audit trail, feature-level breakdown, and plain-language narrative that would survive regulatory scrutiny under CBK Prudential Guidelines on Digital Credit
- **Bias-aware by design** — bias corrections are not an afterthought. They are hardcoded into the scoring engine and surfaced explicitly on every results page

---

## Built At

**Safaricom De{c0}de Hackathon 2025**  
March 31 – April 2, 2025  
Nairobi, Kenya

*Built with the conviction that financial data people already have should be enough to access the credit they deserve.*

---

## License

MIT License

---

## Contact

**Erick Oluga Aboge**  
Lead Software Engineer  
[abogeerick@gmail.com](mailto:abogeerick@gmail.com)  
[GitHub](https://github.com/abogeerick) | [LinkedIn](https://linkedin.com/in/abogeerick)
