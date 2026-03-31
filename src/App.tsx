/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Loader2, 
  ChevronLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  Info,
  Smartphone,
  Wallet,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ApplicantData, CreditAssessment, MPesaTransaction, UtilityRecord, Persona } from './types';
import { DEMO_PERSONAS } from './constants';
import { generateAssessment } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const ScoreGauge = ({ score }: { score: number }) => {
  const data = [
    { value: score - 300 },
    { value: 850 - score },
  ];
  
  const COLORS = ['#22c55e', '#e2e8f0']; // Green and Gray

  return (
    <div className="relative w-64 h-32 mx-auto overflow-hidden">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-4xl font-bold text-slate-900">{score}</span>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Credit Score</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
      <Icon size={24} />
    </div>
    <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </div>
);

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<'landing' | 'input' | 'results'>('landing');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<CreditAssessment | null>(null);
  
  const [formData, setFormData] = useState<ApplicantData>({
    name: '',
    mpesaTransactions: [],
    utilityRecords: [],
    businessSms: ''
  });

  const handleSelectPersona = (persona: Persona) => {
    setFormData(persona.data);
  };

  const handleAddTransaction = () => {
    const newTx: MPesaTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Paybill',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      counterparty: '',
      balance: 0
    };
    setFormData(prev => ({ ...prev, mpesaTransactions: [...prev.mpesaTransactions, newTx] }));
  };

  const handleAddUtility = () => {
    const newUtil: UtilityRecord = {
      id: Math.random().toString(36).substr(2, 9),
      provider: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'active'
    };
    setFormData(prev => ({ ...prev, utilityRecords: [...prev.utilityRecords, newUtil] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await generateAssessment(formData);
      setAssessment(result);
      setPage('results');
    } catch (error) {
      console.error("Assessment failed:", error);
      alert("Failed to generate assessment. Please check your data and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="text-xl font-bold tracking-tight">ACS-KE</span>
          </div>
          {page !== 'landing' && (
            <button 
              onClick={() => setPage(page === 'results' ? 'input' : 'landing')}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {page === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              {/* Hero */}
              <div className="text-center max-w-3xl mx-auto space-y-8">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                  Credit Scoring for the <span className="text-emerald-600">Informal Economy</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  ACS-KE uses AI to analyze M-Pesa patterns and utility records, making financial behavior visible for 70% of unbanked Kenyans.
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setPage('input')}
                    className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 group"
                  >
                    Score an Applicant
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard icon={ShieldCheck} label="Unbanked Invisible" value="70%" />
                <StatCard icon={Wallet} label="Minimum Data" value="KES 0" />
                <StatCard icon={Zap} label="Assessment Time" value="< 30s" />
              </div>

              {/* Mission */}
              <div className="bg-emerald-900 text-white p-12 rounded-3xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                  <p className="text-emerald-100 text-lg leading-relaxed">
                    We believe that financial discipline exists outside of bank statements. By analyzing daily transactions, chama contributions, and utility payments, we empower lenders to reach jua kali workers, boda boda operators, and market traders with confidence.
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-3xl" />
              </div>
            </motion.div>
          )}

          {page === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Applicant Information</h2>
                <p className="text-slate-500">Select a demo persona or enter data manually.</p>
              </div>

              {/* Personas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      formData.name === p.data.name 
                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100" 
                        : "border-slate-200 bg-white hover:border-emerald-300"
                    )}
                  >
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{p.role}</div>
                    <div className="text-xs text-emerald-600 mt-2">{p.location}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                {/* Basic Info */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Applicant Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* M-Pesa Transactions */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">M-Pesa Transactions</label>
                    <button onClick={handleAddTransaction} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:text-emerald-700">
                      <Plus size={16} /> Add Transaction
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.mpesaTransactions.map((tx, idx) => (
                      <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <select 
                          value={tx.type} 
                          onChange={e => {
                            const newTxs = [...formData.mpesaTransactions];
                            newTxs[idx].type = e.target.value as any;
                            setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        >
                          <option>Paybill</option>
                          <option>Buy Goods</option>
                          <option>Send Money</option>
                          <option>Receive Money</option>
                          <option>Withdraw</option>
                          <option>Airtime</option>
                          <option>Fuliza</option>
                        </select>
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={tx.amount || ''}
                          onChange={e => {
                            const newTxs = [...formData.mpesaTransactions];
                            newTxs[idx].amount = Number(e.target.value);
                            setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        />
                        <input 
                          type="date" 
                          value={tx.date}
                          onChange={e => {
                            const newTxs = [...formData.mpesaTransactions];
                            newTxs[idx].date = e.target.value;
                            setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        />
                        <input 
                          type="text" 
                          placeholder="Counterparty" 
                          value={tx.counterparty}
                          onChange={e => {
                            const newTxs = [...formData.mpesaTransactions];
                            newTxs[idx].counterparty = e.target.value;
                            setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm md:col-span-2"
                        />
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, mpesaTransactions: prev.mpesaTransactions.filter(t => t.id !== tx.id) }))}
                          className="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utility Records */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Utility Payments</label>
                    <button onClick={handleAddUtility} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:text-emerald-700">
                      <Plus size={16} /> Add Record
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.utilityRecords.map((util, idx) => (
                      <div key={util.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <input 
                          type="text" 
                          placeholder="Provider (e.g. KPLC)" 
                          value={util.provider}
                          onChange={e => {
                            const newUtils = [...formData.utilityRecords];
                            newUtils[idx].provider = e.target.value;
                            setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        />
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={util.amount || ''}
                          onChange={e => {
                            const newUtils = [...formData.utilityRecords];
                            newUtils[idx].amount = Number(e.target.value);
                            setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        />
                        <input 
                          type="date" 
                          value={util.date}
                          onChange={e => {
                            const newUtils = [...formData.utilityRecords];
                            newUtils[idx].date = e.target.value;
                            setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        />
                        <select 
                          value={util.status}
                          onChange={e => {
                            const newUtils = [...formData.utilityRecords];
                            newUtils[idx].status = e.target.value as any;
                            setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                          }}
                          className="p-2 rounded-lg border border-slate-200 bg-white text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="disconnected">Disconnected</option>
                          <option value="restored">Restored</option>
                        </select>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, utilityRecords: prev.utilityRecords.filter(u => u.id !== util.id) }))}
                          className="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS / Business Activity */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">SMS & Business Records</label>
                  <textarea 
                    rows={4}
                    value={formData.businessSms}
                    onChange={e => setFormData(prev => ({ ...prev, businessSms: e.target.value }))}
                    placeholder="Paste M-Pesa SMS messages or describe business activity..."
                    className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={loading || !formData.name}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing Financial Behavior...
                    </>
                  ) : (
                    "Generate Credit Assessment"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {page === 'results' && assessment && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-bold">Assessment Results</h2>
                  <p className="text-slate-500">Applicant: <span className="font-bold text-slate-900">{formData.name}</span></p>
                </div>
                <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2">
                  <Download size={18} />
                  Export as PDF
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Score & Recommendation */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Score Card */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
                    <ScoreGauge score={assessment.score} />
                    <div className="space-y-2">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest",
                        assessment.tier === 'A' ? "bg-emerald-100 text-emerald-700" :
                        assessment.tier === 'B' ? "bg-blue-100 text-blue-700" :
                        assessment.tier === 'C' ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        Tier {assessment.tier}
                      </div>
                      <p className="text-sm text-slate-500 italic">{assessment.tierDescription}</p>
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs">
                      <Zap size={14} />
                      Lending Recommendation
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-emerald-200">Max Recommended Loan</div>
                      <div className="text-4xl font-bold">KES {assessment.recommendation.maxLoanAmount.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-800">
                      <div>
                        <div className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Tenor</div>
                        <div className="font-bold">{assessment.recommendation.tenor}</div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Rate Tier</div>
                        <div className="font-bold">{assessment.recommendation.interestRate}</div>
                      </div>
                    </div>
                    <div className="bg-emerald-800/50 p-4 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                      <div className="font-bold">{assessment.recommendation.decision}</div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Scorecard & Narrative */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Scorecard Table */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                      <Activity size={20} className="text-emerald-600" />
                      <h3 className="font-bold">Feature Scorecard</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Module</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Weight</th>
                            <th className="px-6 py-4">Contribution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assessment.modules.map(mod => (
                            <tr key={mod.name} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{mod.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{mod.insights[0]}</div>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold">{mod.score}</td>
                              <td className="px-6 py-4 text-slate-500">{mod.weight}%</td>
                              <td className="px-6 py-4">
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full" 
                                    style={{ width: `${(mod.contribution / 850) * 100}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Narrative Section */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                      <Info size={20} className="text-emerald-600" />
                      <h3 className="font-bold">AI Narrative Assessment</h3>
                    </div>
                    <div className="space-y-4 text-slate-600 leading-relaxed">
                      {assessment.narrative.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Card */}
                  <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-emerald-900">Applicant Feedback</h3>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded">EN</span>
                        <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded">SW</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-sm text-emerald-800 font-medium">{assessment.feedback.english}</p>
                        <ul className="space-y-2">
                          {assessment.feedback.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4 border-l border-emerald-200 pl-8">
                        <p className="text-sm text-emerald-800 font-medium italic">{assessment.feedback.kiswahili}</p>
                        <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-4">
                          Thamani yako ya fedha inakua. / Your financial value is growing.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold tracking-tight">ACS-KE</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
          </div>
          <div className="text-sm text-slate-400">
            © 2026 ACS-KE. Safaricom De{'{c0}'}de Hackathon Project.
          </div>
        </div>
      </footer>
    </div>
  );
}
