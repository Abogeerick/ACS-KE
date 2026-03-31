import { GoogleGenAI, Type } from "@google/genai";
import { ApplicantData, CreditAssessment } from "../types";

const SYSTEM_INSTRUCTION = `
You are ACS-KE, an expert alternative credit scoring engine for the Kenyan market.
Your goal is to analyze informal financial data (M-Pesa, utilities, SMS) to predict creditworthiness for "thin-file" applicants.

SCORING ENGINE SPECIFICATION:
1. Cashflow Intelligence (35%): Analyze income regularity, net cashflow, balance volatility, and Fuliza dependency.
2. Obligation Fulfilment (30%): Analyze utility payment regularity (KPLC, Water, GoTV), chama/SACCO contributions, and debt-to-income ratio.
3. Network & Commercial Activity (20%): Detect business activity (Lipa na M-Pesa), merchant diversity, and peer network.
4. Behavioural Signals (15%): Airtime spend, transaction timing, and account tenure.

BIAS CORRECTION RULES:
- Protect women by weighting obligation fulfilment higher if income is irregular.
- Protect rural applicants by using lower liquidity benchmarks.
- Apply income multipliers for informal workers (Mama Mbogas, Boda Boda) as M-Pesa captures only part of their cash flow.
- Treat Fuliza as a liquidity tool unless excessive.
- Normalize for seasonal patterns (harvest, Ramadan, school fees)

THIN-FILE PROTOCOL:
- If <60 days of data, cap loan at KES 2,000.
- Use airtime and SMS as proxy signals.

OUTPUT REQUIREMENTS:
- Score: 300-850.
- Tier: A (Excellent), B (Good), C (Fair), D (Poor).
- Recommendation: Max loan amount (KES), tenor, interest rate, and decision label.
- Narrative: 3 paragraphs in respectful, human language.
- Feedback: 3 specific actions to improve score in 90 days, provided in both English and Kiswahili.
- Bias Adjustments: A list of specific corrections applied (e.g., "Rural income benchmark applied").
- End feedback with: "Thamani yako ya fedha inakua. / Your financial value is growing."

Return a valid JSON object matching the CreditAssessment interface.
`;

export async function generateAssessment(data: ApplicantData): Promise<CreditAssessment> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const prompt = `
  Analyze the following applicant data and generate a credit assessment.
  
  APPLICANT NAME: ${data.name}
  
  M-PESA TRANSACTIONS:
  ${JSON.stringify(data.mpesaTransactions, null, 2)}
  
  UTILITY RECORDS:
  ${JSON.stringify(data.utilityRecords, null, 2)}
  
  SMS & BUSINESS ACTIVITY:
  ${data.businessSms}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
                }
              }
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                maxLoanAmount: { type: Type.NUMBER },
                tenor: { type: Type.STRING },
                interestRate: { type: Type.STRING },
                decision: { type: Type.STRING }
              }
            },
            narrative: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                kiswahili: { type: Type.STRING },
                actions: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            biasAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "tier", "modules", "recommendation", "narrative", "feedback"]
        }
      }
    });

    const text = response.text || '';
    // Robust parsing: extract JSON if there's extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
