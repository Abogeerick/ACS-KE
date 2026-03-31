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
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { ApplicantData, CreditAssessment, MPesaTransaction, UtilityRecord, Persona } from './types';
import { DEMO_PERSONAS, DASHBOARD_STATS } from './constants';
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
  
  const COLORS = ['#10b981', '#1e293b']; // Emerald and Slate-800

  return (
    <div className="relative w-72 h-36 mx-auto overflow-hidden">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={75}
            outerRadius={95}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black text-slate-900 tabular-nums"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Credit Score Index</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, trend }: { icon: any, label: string, value: string, sub?: string, trend?: 'up' | 'down' }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      {trend && (
        <div className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1",
          trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        )}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {sub}
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</div>
    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    {!trend && sub && <div className="text-xs text-emerald-600 font-medium mt-2">{sub}</div>}
  </div>
);

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<'landing' | 'dashboard' | 'input' | 'results'>('landing');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<CreditAssessment | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
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
          <div className="flex items-center gap-6">
            {page !== 'landing' && page !== 'dashboard' && (
              <button 
                onClick={() => setPage('dashboard')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                Dashboard
              </button>
            )}
            {page !== 'landing' && (
              <button 
                onClick={() => setPage(page === 'results' ? 'input' : 'dashboard')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {page === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]"
            >
              {/* Left: Content */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                    <Zap size={12} fill="currentColor" />
                    AI-Powered Credit Intelligence
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
                    SCORING THE <br />
                    <span className="text-emerald-600">UNBANKED.</span>
                  </h1>
                  <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                    ACS-KE transforms M-Pesa transaction patterns and utility history into actionable credit scores for Kenya's informal economy.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setPage('dashboard')}
                    className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 group"
                  >
                    Launch Dashboard
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setPage('input')}
                    className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-5 rounded-2xl font-bold text-lg hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-3"
                  >
                    Try Demo Data
                    <Smartphone size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-200">
                  <div>
                    <div className="text-2xl font-black text-slate-900">70%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unbanked Reach</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">30s</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analysis Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">KES 0</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Integration Cost</div>
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-emerald-600 rounded-[4rem] rotate-3 opacity-10 blur-3xl animate-pulse" />
                <div className="relative bg-white border border-slate-200 rounded-[3rem] shadow-2xl p-8 space-y-8 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Assessment Preview</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                        <Activity size={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                        <div className="h-3 bg-slate-50 rounded-full w-1/2" />
                      </div>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <div className="text-4xl font-black text-emerald-700">742</div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">High Confidence Score</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                        <span>M-Pesa Stability</span>
                        <span className="text-emerald-600">92%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[92%]" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full opacity-10 blur-3xl" />
                </div>
              </div>
            </motion.div>
          )}

          {page === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2">System Overview</div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Lender Dashboard</h2>
                </div>
                <button 
                  onClick={() => setPage('input')}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                >
                  <Plus size={20} strokeWidth={3} />
                  New Assessment
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Activity} label="Scored Today" value={DASHBOARD_STATS.totalApplicants.toString()} sub="+12.5%" trend="up" />
                <StatCard icon={TrendingUp} label="Avg Credit Score" value={DASHBOARD_STATS.averageScore.toString()} sub="Healthy" trend="up" />
                <StatCard icon={CheckCircle2} label="Approval Rate" value={`${DASHBOARD_STATS.approvalRate}%`} sub="Optimized" trend="up" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Volume Analysis (30D)</h3>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Assessments</div>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={DASHBOARD_STATS.scoreHistory}>
                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                          itemStyle={{ fontWeight: 800, color: '#065f46' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Recent Activity</h3>
                    <button className="text-[10px] font-bold text-emerald-600 hover:underline">View All</button>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {DASHBOARD_STATS.recentAssessments.map((item, i) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                            item.tier === 'A' ? "bg-emerald-100 text-emerald-700" :
                            item.tier === 'B' ? "bg-blue-100 text-blue-700" :
                            item.tier === 'C' ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          )}>
                            {item.tier}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">{item.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900 tabular-nums">{item.score}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">Data Entry</div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Applicant Profile</h2>
                  <p className="text-slate-500 font-medium">Select a <span className="text-emerald-600 font-bold">Demo Persona</span> to see instant results, or enter data manually.</p>
                </div>
              </div>

              {/* Personas Selector - Exceptional UI */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={cn(
                      "relative p-5 rounded-[2rem] border-2 text-left transition-all group overflow-hidden",
                      formData.name === p.data.name 
                        ? "border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-100" 
                        : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg"
                    )}
                  >
                    <div className="relative z-10">
                      <div className="text-sm font-black text-slate-900 mb-1">{p.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{p.role}</div>
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Select <ArrowRight size={10} />
                      </div>
                    </div>
                    {formData.name === p.data.name && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. John Doe"
                        className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-lg"
                      />
                    </div>

                    {/* M-Pesa Transactions */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">M-Pesa Ledger</label>
                        <button onClick={handleAddTransaction} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2">
                          <Plus size={14} strokeWidth={3} /> Add Entry
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.mpesaTransactions.map((tx, idx) => (
                          <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <select 
                              value={tx.type} 
                              onChange={e => {
                                const newTxs = [...formData.mpesaTransactions];
                                newTxs[idx].type = e.target.value as any;
                                setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                              }}
                              className="p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
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
                              className="p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
                            />
                            <input 
                              type="date" 
                              value={tx.date}
                              onChange={e => {
                                const newTxs = [...formData.mpesaTransactions];
                                newTxs[idx].date = e.target.value;
                                setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                              }}
                              className="p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
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
                              className="p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm md:col-span-2"
                            />
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, mpesaTransactions: prev.mpesaTransactions.filter(t => t.id !== tx.id) }))}
                              className="text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                        {formData.mpesaTransactions.length === 0 && (
                          <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-2">
                            <div className="text-slate-300 flex justify-center"><Smartphone size={40} /></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions added</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-emerald-400">Quick Analysis</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Our AI engine analyzes the <span className="text-white font-bold">velocity</span>, <span className="text-white font-bold">consistency</span>, and <span className="text-white font-bold">diversity</span> of the provided data points.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        M-Pesa Statement Analysis
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Utility Payment Verification
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Business Activity Extraction
                      </div>
                    </div>
                    <button 
                      onClick={handleSubmit}
                      disabled={loading || !formData.name}
                      className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={24} className="animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Run Assessment
                          <Zap size={20} fill="currentColor" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-4">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Pro Tip</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      For the most accurate score, include at least <span className="font-bold text-slate-900">3 months</span> of M-Pesa transactions and at least <span className="font-bold text-slate-900">one active utility</span> provider.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'results' && assessment && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-6xl mx-auto space-y-10"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2">Assessment Complete</div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Credit Report</h2>
                  <p className="text-slate-500 font-medium">Subject: <span className="font-bold text-slate-900">{formData.name}</span></p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl font-bold text-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2 shadow-sm">
                    <Download size={18} />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => setPage('input')}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    New Search
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Score & Recommendation */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Score Card */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-8 relative overflow-hidden">
                    <div className="relative z-10">
                      <ScoreGauge score={assessment.score} />
                      <div className="space-y-3">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]",
                          assessment.tier === 'A' ? "bg-emerald-100 text-emerald-700" :
                          assessment.tier === 'B' ? "bg-blue-100 text-blue-700" :
                          assessment.tier === 'C' ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        )}>
                          Risk Tier {assessment.tier}
                        </div>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">{assessment.tierDescription}</p>
                      </div>
                    </div>
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50" />
                  </div>

                  {/* Recommendation Card */}
                  <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Zap size={14} fill="currentColor" />
                        Lending Recommendation
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Limit</div>
                        <div className="text-5xl font-black tabular-nums">KES {assessment.recommendation.maxLoanAmount.toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tenor</div>
                          <div className="font-black text-lg">{assessment.recommendation.tenor}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Interest</div>
                          <div className="font-black text-lg text-emerald-400">{assessment.recommendation.interestRate}</div>
                        </div>
                      </div>
                      <div className="bg-emerald-600 p-5 rounded-2xl flex items-center gap-4 shadow-xl shadow-emerald-900/40">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="text-white" size={24} />
                        </div>
                        <div className="font-black text-lg">{assessment.recommendation.decision}</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full blur-3xl opacity-20" />
                  </div>
                </div>

                {/* Right Column: Scorecard & Narrative */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Scorecard Table */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity size={20} className="text-emerald-600" />
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Feature Scorecard</h3>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weighted Index</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Module</th>
                            <th className="px-8 py-5 text-center">Score</th>
                            <th className="px-8 py-5 text-center">Weight</th>
                            <th className="px-8 py-5">Contribution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {assessment.modules.map(mod => (
                            <tr key={mod.name} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-6">
                                <div className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{mod.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{mod.insights[0]}</div>
                              </td>
                              <td className="px-8 py-6 text-center font-black text-slate-900 tabular-nums">{mod.score}</td>
                              <td className="px-8 py-6 text-center text-xs font-bold text-slate-400">{mod.weight}%</td>
                              <td className="px-8 py-6 min-w-[150px]">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(mod.contribution / 850) * 100}%` }}
                                      transition={{ duration: 1, delay: 0.5 }}
                                      className="bg-emerald-500 h-full rounded-full" 
                                    />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-900">{mod.contribution}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Narrative Section */}
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                      <Info size={20} className="text-emerald-600" />
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">AI Narrative Assessment</h3>
                    </div>
                    <div className="space-y-6 text-slate-600 leading-relaxed font-medium relative z-10">
                      {assessment.narrative.map((para, i) => (
                        <p key={i} className="text-lg">{para}</p>
                      ))}
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2" />
                  </div>

                  {/* Transaction History Table */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={20} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Raw Transaction Data</h3>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {showHistory ? "Collapse" : "Expand"} Data ({formData.mpesaTransactions.length})
                      </div>
                    </button>
                    <AnimatePresence>
                      {showHistory && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                  <th className="px-8 py-4">Date</th>
                                  <th className="px-8 py-4">Type</th>
                                  <th className="px-8 py-4">Counterparty</th>
                                  <th className="px-8 py-4 text-right">Amount</th>
                                  <th className="px-8 py-4 text-right">Balance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {formData.mpesaTransactions.map((tx, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4 text-slate-400 font-bold tabular-nums">{tx.date}</td>
                                    <td className="px-8 py-4">
                                      <span className={cn(
                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                        tx.type === 'Receive Money' ? "bg-emerald-100 text-emerald-700" :
                                        tx.type === 'Paybill' || tx.type === 'Buy Goods' ? "bg-blue-100 text-blue-700" :
                                        tx.type === 'Fuliza' ? "bg-rose-100 text-rose-700" :
                                        "bg-slate-100 text-slate-700"
                                      )}>
                                        {tx.type}
                                      </span>
                                    </td>
                                    <td className="px-8 py-4 font-black text-slate-900">{tx.counterparty}</td>
                                    <td className={cn(
                                      "px-8 py-4 text-right font-black tabular-nums",
                                      tx.type === 'Receive Money' ? "text-emerald-600" : "text-slate-900"
                                    )}>
                                      {tx.type === 'Receive Money' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-4 text-right font-bold text-slate-400 tabular-nums">{tx.balance.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feedback Card */}
                  <div className="bg-emerald-900 text-white p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <h3 className="font-black text-xs uppercase tracking-[0.3em] text-emerald-400">Applicant Feedback</h3>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-black bg-emerald-800 text-emerald-200 px-3 py-1 rounded-lg">EN</span>
                        <span className="text-[10px] font-black bg-emerald-800 text-emerald-200 px-3 py-1 rounded-lg">SW</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-6">
                        <p className="text-xl text-emerald-50 font-bold leading-relaxed">{assessment.feedback.english}</p>
                        <ul className="space-y-3">
                          {assessment.feedback.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-emerald-200 font-medium">
                              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6 md:border-l md:border-emerald-800 md:pl-12">
                        <p className="text-xl text-emerald-100 font-bold leading-relaxed italic">{assessment.feedback.kiswahili}</p>
                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-6">
                          Thamani yako ya fedha inakua. / Your financial value is growing.
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-20" />
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
