export interface MPesaTransaction {
  id: string;
  type: 'Paybill' | 'Buy Goods' | 'Send Money' | 'Receive Money' | 'Withdraw' | 'Airtime' | 'Fuliza';
  amount: number;
  date: string;
  counterparty: string;
  balance: number;
}

export interface UtilityRecord {
  id: string;
  provider: string;
  date: string;
  amount: number;
  status: 'active' | 'disconnected' | 'restored';
}

export interface ApplicantData {
  name: string;
  mpesaTransactions: MPesaTransaction[];
  utilityRecords: UtilityRecord[];
  businessSms: string;
}

export interface ScoringModule {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  insights: string[];
}

export interface CreditAssessment {
  score: number;
  tier: 'A' | 'B' | 'C' | 'D';
  tierDescription: string;
  modules: ScoringModule[];
  recommendation: {
    maxLoanAmount: number;
    tenor: string;
    interestRate: string;
    decision: 'Auto-Approve' | 'Approve with Monitoring' | 'Conditional Approval' | 'Starter Credit';
  };
  narrative: string[];
  feedback: {
    english: string;
    kiswahili: string;
    actions: string[];
  };
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  location: string;
  data: ApplicantData;
}
