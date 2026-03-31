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
        { id: '1', type: 'Receive Money', amount: 4500, date: '2026-03-25', counterparty: 'Customer A', balance: 12000 },
        { id: '2', type: 'Paybill', amount: 2500, date: '2026-03-01', counterparty: 'Rent - Landlord', balance: 9500 },
        { id: '3', type: 'Paybill', amount: 1200, date: '2026-03-15', counterparty: 'KPLC Prepaid', balance: 8300 },
        { id: '4', type: 'Buy Goods', amount: 3000, date: '2026-03-10', counterparty: 'Wholesale Supplies', balance: 5300 },
        { id: '5', type: 'Fuliza', amount: 500, date: '2026-03-12', counterparty: 'Safaricom', balance: 4800 },
        { id: '6', type: 'Receive Money', amount: 500, date: '2026-03-13', counterparty: 'Repayment', balance: 5300 },
      ],
      utilityRecords: [
        { id: 'u1', provider: 'KPLC', date: '2026-03-15', amount: 1200, status: 'active' },
        { id: 'u2', provider: 'Nairobi Water', date: '2026-02-28', amount: 450, status: 'active' },
      ],
      businessSms: "Confirmed. You have received KES 4,500 from Customer A. New M-PESA balance is KES 12,000. \nInvoice #442 for Gikomba Stall supplies paid via Lipa na M-Pesa."
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
        { id: 'd1', type: 'Receive Money', amount: 200, date: '2026-03-29', counterparty: 'Passenger 1', balance: 1500 },
        { id: 'd2', type: 'Receive Money', amount: 150, date: '2026-03-29', counterparty: 'Passenger 2', balance: 1650 },
        { id: 'd3', type: 'Fuliza', amount: 1000, date: '2026-03-20', counterparty: 'Safaricom', balance: 200 },
        { id: 'd4', type: 'Paybill', amount: 500, date: '2026-03-27', counterparty: 'Chama Friday', balance: 300 },
      ],
      utilityRecords: [
        { id: 'du1', provider: 'GoTV', date: '2026-02-15', amount: 900, status: 'disconnected' },
      ],
      businessSms: "Boda boda daily earnings logged. Chama contribution of 500 KES confirmed for week 12."
    }
  },
  {
    id: 'amina',
    name: 'Amina',
    role: 'Seamstress & M-Pesa Agent',
    location: 'Mombasa',
    data: {
      name: 'Amina Hassan',
      mpesaTransactions: [
        { id: 'a1', type: 'Receive Money', amount: 50000, date: '2026-03-28', counterparty: 'Agent Float', balance: 150000 },
        { id: 'a2', type: 'Paybill', amount: 4500, date: '2026-03-05', counterparty: 'School Fees', balance: 145500 },
        { id: 'a3', type: 'Paybill', amount: 2200, date: '2026-03-10', counterparty: 'KPLC Postpaid', balance: 143300 },
      ],
      utilityRecords: [
        { id: 'au1', provider: 'KPLC', date: '2026-03-10', amount: 2200, status: 'active' },
        { id: 'au2', provider: 'Mombasa Water', date: '2026-03-12', amount: 800, status: 'active' },
      ],
      businessSms: "Fabric purchase invoice #992 confirmed. KES 15,000 paid to Textile Wholesalers. M-Pesa Agent commission for Feb: KES 12,400."
    }
  }
];
