import { Persona } from './types';

export const DEMO_PERSONAS: Persona[] = [
  {
    id: 'grace',
    name: 'Grace',
    role: 'Market Trader',
    location: 'Gikomba, Nairobi',
    data: {
      name: 'Grace Wambui',
      mpesaTransactions: [
        { id: 'g1', type: 'Receive Money', amount: 4500, date: '2026-03-25', counterparty: 'JOHN KAMAU', balance: 12000 },
        { id: 'g2', type: 'Paybill', amount: 2500, date: '2026-03-01', counterparty: '888888 - KPLC PREPAID', balance: 9500 },
        { id: 'g3', type: 'Buy Goods', amount: 3000, date: '2026-03-10', counterparty: 'MAMA PIMA HARDWARE', balance: 6500 },
        { id: 'g4', type: 'Paybill', amount: 1200, date: '2026-03-15', counterparty: '888880 - NAIROBI WATER', balance: 5300 },
        { id: 'g5', type: 'Fuliza', amount: 500, date: '2026-03-12', counterparty: 'SAFARICOM', balance: 4800 },
        { id: 'g6', type: 'Receive Money', amount: 5200, date: '2026-03-28', counterparty: 'STEPHEN NJOROGE', balance: 10000 },
        { id: 'g7', type: 'Buy Goods', amount: 1500, date: '2026-03-29', counterparty: 'QUICKMART KANGEMI', balance: 8500 },
      ],
      utilityRecords: [
        { id: 'u1', provider: 'KPLC', date: '2026-03-01', amount: 2500, status: 'active' },
        { id: 'u2', provider: 'Nairobi Water', date: '2026-03-15', amount: 1200, status: 'active' },
      ],
      businessSms: "Confirmed. You have received KES 4,500 from JOHN KAMAU. New M-PESA balance is KES 12,000. \nInvoice #442 for Gikomba Stall supplies paid via Lipa na M-Pesa."
    }
  },
  {
    id: 'david',
    name: 'David',
    role: 'Boda Boda Operator',
    location: 'Kisumu',
    data: {
      name: 'David Otieno',
      mpesaTransactions: [
        { id: 'd1', type: 'Receive Money', amount: 250, date: '2026-03-29', counterparty: 'PASSENGER 1', balance: 1500 },
        { id: 'd2', type: 'Receive Money', amount: 300, date: '2026-03-29', counterparty: 'PASSENGER 2', balance: 1800 },
        { id: 'd3', type: 'Fuliza', amount: 1000, date: '2026-03-20', counterparty: 'SAFARICOM', balance: 800 },
        { id: 'd4', type: 'Paybill', amount: 500, date: '2026-03-27', counterparty: 'CHAMA FRIDAY', balance: 300 },
        { id: 'd5', type: 'Paybill', amount: 900, date: '2026-02-15', counterparty: '818181 - GOTV', balance: -600 },
      ],
      utilityRecords: [
        { id: 'du1', provider: 'GoTV', date: '2026-02-15', amount: 900, status: 'disconnected' },
      ],
      businessSms: "Boda boda daily earnings logged. Chama contribution of 500 KES confirmed for week 12. GoTV service disconnected due to non-payment."
    }
  },
  {
    id: 'amina',
    name: 'Amina',
    role: 'Seamstress & Agent',
    location: 'Mombasa',
    data: {
      name: 'Amina Hassan',
      mpesaTransactions: [
        { id: 'a1', type: 'Receive Money', amount: 50000, date: '2026-03-28', counterparty: 'AGENT FLOAT', balance: 150000 },
        { id: 'a2', type: 'Paybill', amount: 4500, date: '2026-03-05', counterparty: 'SCHOOL FEES PAYBILL', balance: 145500 },
        { id: 'a3', type: 'Paybill', amount: 2200, date: '2026-03-10', counterparty: '888888 - KPLC POSTPAID', balance: 143300 },
        { id: 'a4', type: 'Buy Goods', amount: 15000, date: '2026-03-12', counterparty: 'TEXTILE WHOLESALERS', balance: 128300 },
      ],
      utilityRecords: [
        { id: 'au1', provider: 'KPLC', date: '2026-03-10', amount: 2200, status: 'active' },
        { id: 'au2', provider: 'Mombasa Water', date: '2026-03-12', amount: 800, status: 'active' },
      ],
      businessSms: "Fabric purchase invoice #992 confirmed. KES 15,000 paid to Textile Wholesalers. M-Pesa Agent commission for Feb: KES 12,400."
    }
  },
  {
    id: 'peter',
    name: 'Peter',
    role: 'Smallholder Farmer',
    location: 'Eldoret',
    data: {
      name: 'Peter Kipkorir',
      mpesaTransactions: [
        { id: 'p1', type: 'Receive Money', amount: 85000, date: '2025-11-15', counterparty: 'CEREAL BOARD HARVEST', balance: 92000 },
        { id: 'p2', type: 'Paybill', amount: 15000, date: '2025-11-20', counterparty: '521900 - M-KOPA SOLAR', balance: 77000 },
        { id: 'p3', type: 'Buy Goods', amount: 8000, date: '2025-12-05', counterparty: 'ELDORET AGROVET', balance: 69000 },
        { id: 'p4', type: 'Receive Money', amount: 12000, date: '2026-01-10', counterparty: 'MILK COLLECTION CENTER', balance: 81000 },
      ],
      utilityRecords: [
        { id: 'pu1', provider: 'M-KOPA', date: '2025-11-20', amount: 15000, status: 'active' },
      ],
      businessSms: "Harvest payment of 85,000 KES received from NCPB. Agrochemicals purchased for next season."
    }
  },
  {
    id: 'wanjiru',
    name: 'Wanjiru',
    role: 'Primary Teacher',
    location: 'Nyeri',
    data: {
      name: 'Wanjiru Maina',
      mpesaTransactions: [
        { id: 'w1', type: 'Receive Money', amount: 38000, date: '2026-02-28', counterparty: 'TSC SALARY B2C', balance: 42000 },
        { id: 'w2', type: 'Paybill', amount: 12000, date: '2026-03-02', counterparty: 'EQUITY BANK LOAN', balance: 30000 },
        { id: 'w3', type: 'Receive Money', amount: 5000, date: '2026-03-10', counterparty: 'TUTORING EXTRA', balance: 35000 },
        { id: 'w4', type: 'Paybill', amount: 3500, date: '2026-03-15', counterparty: '888888 - KPLC', balance: 31500 },
      ],
      utilityRecords: [
        { id: 'wu1', provider: 'KPLC', date: '2026-03-15', amount: 3500, status: 'active' },
      ],
      businessSms: "Salary of 38,000 KES credited. Extra tutoring payment of 5,000 KES received from Parent X."
    }
  },
  {
    id: 'hassan',
    name: 'Hassan',
    role: 'Matatu Tout',
    location: 'Mombasa',
    data: {
      name: 'Hassan Ali',
      mpesaTransactions: [
        { id: 'h1', type: 'Receive Money', amount: 500, date: '2026-03-28', counterparty: 'DRIVER DAILY', balance: 1200 },
        { id: 'h2', type: 'Airtime', amount: 100, date: '2026-03-28', counterparty: 'SAFARICOM', balance: 1100 },
        { id: 'h3', type: 'Withdraw', amount: 1000, date: '2026-03-29', counterparty: 'AGENT 2210', balance: 100 },
      ],
      utilityRecords: [],
      businessSms: "Daily cash collections high, but M-Pesa usage limited to small withdrawals and airtime."
    }
  },
  {
    id: 'akinyi',
    name: 'Akinyi',
    role: 'Mama Mboga',
    location: 'Kisumu',
    data: {
      name: 'Akinyi Odhiambo',
      mpesaTransactions: [
        { id: 'ak1', type: 'Receive Money', amount: 1200, date: '2026-03-20', counterparty: 'CUSTOMER 1', balance: 2500 },
        { id: 'ak2', type: 'Buy Goods', amount: 800, date: '2026-03-22', counterparty: 'KIBUYE WHOLESALE', balance: 1700 },
      ],
      utilityRecords: [],
      businessSms: "New M-Pesa user. Started using Lipa na M-Pesa for vegetable supplies 6 weeks ago."
    }
  },
  {
    id: 'james',
    name: 'James',
    role: 'Uber Driver',
    location: 'Nairobi',
    data: {
      name: 'James Kamau',
      mpesaTransactions: [
        { id: 'j1', type: 'Receive Money', amount: 850, date: '2026-03-30', counterparty: 'RIDER A', balance: 4500 },
        { id: 'j2', type: 'Receive Money', amount: 1200, date: '2026-03-30', counterparty: 'RIDER B', balance: 5700 },
        { id: 'j3', type: 'Paybill', amount: 2000, date: '2026-03-30', counterparty: 'RUBIS GAS STATION', balance: 3700 },
        { id: 'j4', type: 'Paybill', amount: 500, date: '2026-03-30', counterparty: 'UBER COMMISSION', balance: 3200 },
        { id: 'j5', type: 'Receive Money', amount: 1500, date: '2026-03-29', counterparty: 'RIDER C', balance: 4700 },
        { id: 'j6', type: 'Paybill', amount: 1000, date: '2026-03-29', counterparty: 'TOTAL ENERGIES', balance: 3700 },
      ],
      utilityRecords: [
        { id: 'ju1', provider: 'Nairobi Water', date: '2026-03-10', amount: 600, status: 'active' },
      ],
      businessSms: "Uber trip earnings received. Fuel paid via Paybill at Rubis. Vehicle maintenance scheduled for next week."
    }
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Diaspora Returnee',
    location: 'Nairobi / London',
    data: {
      name: 'Sarah Njeri',
      mpesaTransactions: [
        { id: 's1', type: 'Receive Money', amount: 150000, date: '2026-03-25', counterparty: 'WORLDREMIT TRANSFER', balance: 165000 },
        { id: 's2', type: 'Paybill', amount: 45000, date: '2026-03-26', counterparty: 'RENT PAYMENT', balance: 120000 },
        { id: 's3', type: 'Buy Goods', amount: 12000, date: '2026-03-27', counterparty: 'CARREFOUR TWO RIVERS', balance: 108000 },
        { id: 's4', type: 'Paybill', amount: 5000, date: '2026-03-28', counterparty: '888888 - KPLC', balance: 103000 },
      ],
      utilityRecords: [
        { id: 'su1', provider: 'KPLC', date: '2026-03-28', amount: 5000, status: 'active' },
      ],
      businessSms: "Remittance received from UK account. High-value spending patterns at major retailers. Consistent utility payments."
    }
  },
  {
    id: 'otieno',
    name: 'Otieno',
    role: 'Jua Kali Mechanic',
    location: 'Kamukunji, Nairobi',
    data: {
      name: 'Otieno Juma',
      mpesaTransactions: [
        { id: 'o1', type: 'Receive Money', amount: 15000, date: '2026-03-20', counterparty: 'ENGINE OVERHAUL CLIENT', balance: 18000 },
        { id: 'o2', type: 'Buy Goods', amount: 9000, date: '2026-03-21', counterparty: 'SPARE PARTS DEPOT', balance: 9000 },
        { id: 'o3', type: 'Receive Money', amount: 3500, date: '2026-03-22', counterparty: 'BRAKE PAD REPLACEMENT', balance: 12500 },
        { id: 'o4', type: 'Fuliza', amount: 2000, date: '2026-03-15', counterparty: 'SAFARICOM', balance: 500 },
      ],
      utilityRecords: [],
      businessSms: "Kamukunji workshop activity. Large inflows followed by immediate spare parts purchases. Occasional Fuliza usage for liquidity."
    }
  }
];

export const DASHBOARD_STATS = {
  totalApplicants: 47,
  averageScore: 612,
  approvalRate: 73,
  scoreHistory: [
    { day: '1', count: 20 },
    { day: '5', count: 25 },
    { day: '10', count: 45 },
    { day: '15', count: 38 },
    { day: '20', count: 62 },
    { day: '25', count: 75 },
    { day: '30', count: 80 },
  ],
  recentAssessments: [
    { name: 'John Kamau', score: 742, tier: 'A', time: '12 mins ago' },
    { name: 'Sarah Wambui', score: 580, tier: 'B', time: '45 mins ago' },
    { name: 'Kevin Otieno', score: 420, tier: 'C', time: '2 hours ago' },
    { name: 'Mary Njeri', score: 810, tier: 'A', time: '3 hours ago' },
    { name: 'David Musyoka', score: 350, tier: 'D', time: '5 hours ago' },
    { name: 'Faith Chepngetich', score: 690, tier: 'B', time: '6 hours ago' },
    { name: 'Samuel Mwangi', score: 520, tier: 'C', time: '8 hours ago' },
    { name: 'Lydia Akinyi', score: 715, tier: 'A', time: '10 hours ago' },
  ]
};
