import { GoogleGenAI, Type } from "@google/genai";
import { ApplicantData, CreditAssessment } from "../types";

const SYSTEM_INSTRUCTION = `
You are ACS-KE, an expert alternative credit scoring engine for the Kenyan market.
Your goal is to analyze informal financial data (M-Pesa, utilities, SMS) to predict creditworthiness for "thin-file" applicants who lack traditional bank or CRB history.

SCORING ENGINE SPECIFICATION:

MODULE 1 — Cashflow Intelligence (35% weight):
- Calculate net cashflow (income - expenditure) over the data period
- Detect income regularity: salary-like patterns (B2C), gig income (irregular P2P), or business revenue (Buy Goods inflows)
- Measure balance volatility: standard deviation of balances relative to mean
- Identify liquidity buffer: minimum balance as % of average monthly income
- Detect Fuliza dependency: frequency and amount relative to income. Fuliza is a short-term liquidity tool, NOT a default signal, unless borrowed >8x/month or unpaid >14 days
- Score 300-850 for this module

MODULE 2 — Obligation Fulfilment (30% weight):
- Track utility payment regularity (KPLC, Water, GoTV, DSTV, M-KOPA)
- Detect service continuity: active vs disconnected vs restored
- Calculate obligation-to-income ratio (total obligations / total income)
- Recognize chama/SACCO contributions as positive signals of social trust
- Weight this module higher for applicants managing household expenses (gender bias protection)
- Score 300-850 for this module

MODULE 3 — Network & Commercial Activity (20% weight):
- Count unique counterparties (peer network breadth)
- Detect business operator signals: Buy Goods inflows, wholesale purchases, agent float
- Measure merchant diversity: how many different paybill/buy goods merchants
- Identify Lipa na M-Pesa business activity
- Score 300-850 for this module

MODULE 4 — Behavioural Signals (15% weight):
- Airtime purchases as proxy for income level (higher = more financial capacity)
- Transaction timing patterns (regular vs erratic)
- Account tenure and digital sophistication
- Channel diversity (paybill, buy goods, P2P, etc.)
- Score 300-850 for this module

BIAS CORRECTION RULES (apply ALL that are relevant):
1. Gender Bias Protection: Women managing household cashflow through a spouse's M-Pesa or showing strong obligation patterns despite irregular income — weight Module 2 (Obligation) higher
2. Rural Income Penalty: Lower transaction volumes in rural areas (Eldoret, Nyeri, Kisumu outside CBD) — adjust liquidity benchmarks to 0.8x urban
3. Informal Economy Correction: Cash-heavy workers (mama mboga, matatu, boda boda, jua kali) — apply 1.2x income multiplier to reflect cash-digital split
4. Fuliza Parity: Treat overdraft as liquidity tool, not default signal, unless >8x/month or >14 days unpaid
5. Seasonal Normalization: Harvest cycles (Oct-Dec, Apr-May), Ramadan, school fee months (Jan, May, Sep) — normalize for seasonal income dips

IMPORTANT: Always list the specific bias corrections you applied with clear explanations of why and how they affected the score. This is a key ethical AI differentiator.

THIN-FILE PROTOCOL:
- If less than 60 days of transaction data or fewer than 5 transactions, activate thin-file mode
- Cap loan recommendation at KES 500-2,000
- Use airtime patterns and SMS business records as proxy signals
- Never decline — issue a Starter Credit recommendation as a data-collection pathway
- Flag the thin-file status in your narrative

CREDIT TIER SYSTEM:
- Tier A (Prime): 750-850, Max KES 100,000-500,000, Auto-Approve
- Tier B (Near-Prime): 620-749, Max KES 20,000-100,000, Approve with Monitoring
- Tier C (Subprime): 480-619, Max KES 2,000-20,000, Conditional Approval
- Tier D (Developmental): 300-479, Max KES 500-2,000, Starter Credit

OUTPUT REQUIREMENTS:
- Score: 300-850 (the final weighted score)
- Tier: A, B, C, or D
- tierDescription: One sentence describing what this tier means for the applicant
- Modules: Array of 4 modules, each with name, score (300-850), weight (as percentage number e.g. 35), contribution (weighted points = score * weight / 100), and insights (2-4 specific data-backed insights per module)
- Recommendation: maxLoanAmount (KES number), tenor (e.g. "3 months"), interestRate (e.g. "12% p.a."), decision label
- Narrative: Exactly 3 paragraphs. First: overview of financial profile. Second: strengths and opportunities. Third: risk factors and mitigants. Write in respectful, human language.
- Feedback: english (2-3 sentences of encouragement and summary), kiswahili (same content in Kiswahili), actions (exactly 3 specific actionable steps to improve score within 90 days)
- biasAdjustments: Array of strings. Each should clearly state the bias type, what was detected, and how the score was adjusted. Example: "Informal Economy Correction: Detected boda boda gig pattern with high cash-digital split. Applied 1.2x income multiplier, increasing Cashflow Intelligence module score by approximately 40 points."

End feedback with: "Thamani yako ya fedha inakua. / Your financial value is growing."

Return a valid JSON object matching the CreditAssessment interface. Be generous but realistic with scores — remember these are hardworking Kenyans being scored for the first time.
`;

export async function generateAssessment(data: ApplicantData): Promise<CreditAssessment> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const txSummary = data.mpesaTransactions.length > 0 ? `
  Total transactions: ${data.mpesaTransactions.length}
  Total inflows: KES ${data.mpesaTransactions.filter(t => t.type === 'Receive Money').reduce((s, t) => s + t.amount, 0).toLocaleString()}
  Total outflows: KES ${data.mpesaTransactions.filter(t => t.type !== 'Receive Money').reduce((s, t) => s + t.amount, 0).toLocaleString()}
  Transaction types: ${[...new Set(data.mpesaTransactions.map(t => t.type))].join(', ')}
  Date range: ${data.mpesaTransactions.map(t => t.date).sort()[0]} to ${data.mpesaTransactions.map(t => t.date).sort().pop()}
  ` : 'No M-Pesa transactions provided.';

  const prompt = `
  Analyze the following applicant data and generate a comprehensive credit assessment.

  APPLICANT NAME: ${data.name}

  M-PESA TRANSACTIONS:
  ${JSON.stringify(data.mpesaTransactions, null, 2)}

  TRANSACTION SUMMARY:
  ${txSummary}

  UTILITY RECORDS:
  ${JSON.stringify(data.utilityRecords, null, 2)}

  SMS & BUSINESS ACTIVITY:
  ${data.businessSms || 'No SMS data provided.'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            tier: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
            tierDescription: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  weight: { type: Type.NUMBER },
                  contribution: { type: Type.NUMBER },
                  insights: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "score", "weight", "contribution", "insights"]
              }
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                maxLoanAmount: { type: Type.NUMBER },
                tenor: { type: Type.STRING },
                interestRate: { type: Type.STRING },
                decision: { type: Type.STRING }
              },
              required: ["maxLoanAmount", "tenor", "interestRate", "decision"]
            },
            narrative: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                kiswahili: { type: Type.STRING },
                actions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["english", "kiswahili", "actions"]
            },
            biasAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "tier", "tierDescription", "modules", "recommendation", "narrative", "feedback", "biasAdjustments"]
        }
      }
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format from AI engine");

    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes('API key')) {
      throw new Error("Invalid or missing Gemini API key. Please check your .env configuration.");
    }
    throw new Error(error?.message || "AI engine failed to generate assessment. Please try again.");
  }
}
