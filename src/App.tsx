/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  Activity,
  Users,
  BarChart3,
  Globe,
  Heart,
  Shield,
  Eye,
  FileText,
  MapPin,
  Star,
  Sparkles,
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  Menu,
  X,
  Home
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

// --- Animated Counter ---
function useAnimatedCounter(target: number, duration = 2000, enabled = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) { setCount(0); return; }
    const startTime = performance.now();
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);
  return count;
}

// --- Score Gauge ---
const ScoreGauge = ({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) => {
  const displayScore = useAnimatedCounter(score, 2000, true);
  const tierColor = score >= 750 ? '#059669' : score >= 620 ? '#2563eb' : score >= 480 ? '#d97706' : '#e11d48';
  const data = [{ value: score - 300 }, { value: 850 - score }];
  const isSmall = size === 'sm';

  return (
    <div className={cn("relative mx-auto overflow-hidden", isSmall ? "w-48 h-24" : "w-64 h-32")}>
      <ResponsiveContainer width="100%" height={isSmall ? 160 : 220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={isSmall ? 50 : 70} outerRadius={isSmall ? 65 : 88} paddingAngle={0} dataKey="value" stroke="none">
            <Cell fill={tierColor} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className={cn("font-black text-slate-900 tabular-nums", isSmall ? "text-3xl" : "text-5xl")}>
          {displayScore}
        </motion.span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Credit Score</span>
      </div>
    </div>
  );
};

// --- Analysis Loading ---
const ANALYSIS_STAGES = [
  { label: 'Ingesting M-Pesa transaction ledger', icon: Smartphone },
  { label: 'Analyzing cashflow patterns', icon: BarChart3 },
  { label: 'Verifying utility payments', icon: Zap },
  { label: 'Detecting business activity', icon: Globe },
  { label: 'Applying bias corrections', icon: Shield },
  { label: 'Generating credit report', icon: FileText },
];

const AnalysisLoading = () => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage(p => Math.min(p + 1, ANALYSIS_STAGES.length - 1)), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto border-4 border-emerald-500/20 border-t-emerald-500 rounded-full" />
        <div>
          <h3 className="text-xl font-black text-white">AI Analysis in Progress</h3>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Powered by Google Gemini</p>
        </div>
        <div className="space-y-2 text-left">
          {ANALYSIS_STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= stage ? 1 : 0.2, x: 0 }} transition={{ delay: i * 0.1 }}
                className={cn("flex items-center gap-3 p-3 rounded-xl", i === stage && "bg-emerald-500/10 border border-emerald-500/20")}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                  i < stage ? "bg-emerald-500/20 text-emerald-400" : i === stage ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-600")}>
                  {i < stage ? <CheckCircle2 size={14} /> : i === stage ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
                </div>
                <span className={cn("text-xs font-bold", i < stage ? "text-emerald-400" : i === stage ? "text-white" : "text-slate-600")}>{s.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// --- PDF Export ---
async function exportPDF(elementId: string, filename: string) {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#f8fafc', logging: false });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const iw = pw - 20;
  const ih = (canvas.height * iw) / canvas.width;
  let left = ih;
  let pos = 10;
  pdf.addImage(imgData, 'PNG', 10, pos, iw, ih);
  left -= (ph - 20);
  while (left > 0) {
    pos = left - ih + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, pos, iw, ih);
    left -= (ph - 20);
  }
  pdf.save(filename);
}

// ===================== MAIN APP =====================

export default function App() {
  type Page = 'home' | 'dashboard' | 'assess' | 'results';
  const [page, setPage] = useState<Page>('home');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<CreditAssessment | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicantData>({
    name: '', mpesaTransactions: [], utilityRecords: [], businessSms: ''
  });

  const handleSelectPersona = (p: Persona) => {
    setFormData(p.data);
    setSelectedPersona(p.id);
    setError(null);
  };

  const handleAddTransaction = () => {
    setFormData(prev => ({
      ...prev,
      mpesaTransactions: [...prev.mpesaTransactions, {
        id: Math.random().toString(36).substr(2, 9),
        type: 'Paybill', amount: 0, date: new Date().toISOString().split('T')[0], counterparty: '', balance: 0
      }]
    }));
  };

  const handleAddUtility = () => {
    setFormData(prev => ({
      ...prev,
      utilityRecords: [...prev.utilityRecords, {
        id: Math.random().toString(36).substr(2, 9),
        provider: '', date: new Date().toISOString().split('T')[0], amount: 0, status: 'active'
      }]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateAssessment(formData);
      setAssessment(result);
      setPage('results');
    } catch (err: any) {
      setError(err?.message || "Assessment failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = (p: Page) => { setPage(p); setSidebarOpen(false); };

  const tierDistribution = [
    { name: 'Tier A', value: 28, color: '#059669' },
    { name: 'Tier B', value: 35, color: '#2563eb' },
    { name: 'Tier C', value: 25, color: '#d97706' },
    { name: 'Tier D', value: 12, color: '#e11d48' },
  ];

  // Sidebar nav items
  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assess' as Page, label: 'New Assessment', icon: UserPlus },
    ...(assessment ? [{ id: 'results' as Page, label: 'Latest Report', icon: ClipboardList }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      <AnimatePresence>{loading && <AnalysisLoading />}</AnimatePresence>

      {/* ===== SIDEBAR ===== */}
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-slate-900 flex-col z-40">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg">A</div>
            <div>
              <div className="text-white font-black text-lg tracking-tight">ACS-KE</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Credit Scorer</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.id)}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30" : "text-slate-400 hover:text-white hover:bg-slate-800")}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Personas Quick Select */}
        <div className="p-4 border-t border-slate-800">
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Demo Personas</div>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {DEMO_PERSONAS.map(p => (
              <button key={p.id} onClick={() => { handleSelectPersona(p); navigate('assess'); }}
                className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all",
                  selectedPersona === p.id ? "bg-emerald-600/10 text-emerald-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}>
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0",
                  selectedPersona === p.id ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500")}>
                  {p.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{p.name}</div>
                  <div className="text-[9px] text-slate-600 truncate">{p.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="text-[9px] text-slate-600 font-medium text-center">
            Safaricom De&#123;c0&#125;de 2025
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
          <span className="font-black text-lg tracking-tight">ACS-KE</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 flex flex-col overflow-y-auto">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black">A</div>
                  <span className="text-white font-black">ACS-KE</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.id} onClick={() => navigate(item.id)}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                        page === item.id ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}>
                      <Icon size={18} />{item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-800">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-3">Demo Personas</div>
                {DEMO_PERSONAS.map(p => (
                  <button key={p.id} onClick={() => { handleSelectPersona(p); navigate('assess'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-slate-500 hover:text-slate-300 hover:bg-slate-800/50">
                    <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">{p.name[0]}</div>
                    <span className="text-xs font-bold">{p.name}</span>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AnimatePresence mode="wait">

            {/* ========== HOME ========== */}
            {page === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                {/* Hero */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
                  <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      <Zap size={12} fill="currentColor" />
                      Safaricom De&#123;c0&#125;de 2025
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
                      Scoring the<br /><span className="text-emerald-400">Unbanked.</span>
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                      AI-powered alternative credit scoring using M-Pesa transaction patterns, utility payments, and SMS business records for Kenya's 19 million credit-invisible adults.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button onClick={() => navigate('assess')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-900/30 transition-all group">
                        Try Demo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => navigate('dashboard')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 backdrop-blur-sm transition-all">
                        <LayoutDashboard size={16} /> View Dashboard
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
                  <div className="absolute bottom-0 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
                </div>

                {/* How it works */}
                <div className="space-y-6">
                  <h2 className="text-xl font-black tracking-tight">How It Works</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Smartphone, step: '01', title: 'Ingest Data', desc: 'M-Pesa transaction history, utility payment records, and SMS business activity' },
                      { icon: Sparkles, step: '02', title: 'AI Analysis', desc: '4-module scoring engine with 5 built-in bias corrections powered by Google Gemini' },
                      { icon: FileText, step: '03', title: 'Credit Report', desc: 'Credit tier, loan recommendation, and bilingual feedback in under 30 seconds' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-lg hover:border-emerald-200 transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <s.icon size={20} />
                          </div>
                          <span className="text-3xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors">{s.step}</span>
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900">{s.title}</h3>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scoring Modules */}
                <div className="space-y-6">
                  <h2 className="text-xl font-black tracking-tight">4-Module Scoring Engine</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'Cashflow Intelligence', weight: 35, desc: 'Income regularity, net flow, balance volatility, Fuliza dependency', color: 'emerald' },
                      { name: 'Obligation Fulfilment', weight: 30, desc: 'Utility payments, chama/SACCO contributions, obligation-to-income ratio', color: 'blue' },
                      { name: 'Network & Commerce', weight: 20, desc: 'Merchant diversity, business detection, peer network breadth', color: 'violet' },
                      { name: 'Behavioural Signals', weight: 15, desc: 'Airtime proxy income, transaction timing, channel sophistication', color: 'amber' },
                    ].map((mod, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0",
                          mod.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                          mod.color === 'blue' ? "bg-blue-50 text-blue-600" :
                          mod.color === 'violet' ? "bg-violet-50 text-violet-600" :
                          "bg-amber-50 text-amber-600"
                        )}>
                          {mod.weight}%
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900">{mod.name}</h3>
                          <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{mod.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bias Corrections */}
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-6 sm:p-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center"><Shield size={20} className="text-white" /></div>
                    <div>
                      <h2 className="font-black text-slate-900">Built-In Bias Corrections</h2>
                      <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Ethical AI by Design</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { title: 'Gender Protection', desc: 'Weights obligation fulfilment higher for household managers' },
                      { title: 'Rural Parity', desc: 'Adjusts liquidity benchmarks for lower-volume rural areas' },
                      { title: 'Informal Economy', desc: '1.2x income multiplier for cash-heavy workers' },
                      { title: 'Fuliza Parity', desc: 'Overdraft treated as liquidity tool, not default signal' },
                      { title: 'Seasonal Normalization', desc: 'Adjusts for harvest cycles, Ramadan, school fees' },
                    ].map((b, i) => (
                      <div key={i} className="bg-white/70 p-4 rounded-xl border border-violet-100 flex items-start gap-3">
                        <ShieldCheck size={16} className="text-violet-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-black text-slate-800">{b.title}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">{b.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Target Users', value: '19M+' },
                    { label: 'Analysis Time', value: '<30s' },
                    { label: 'Bias Guards', value: '5' },
                    { label: 'Min Score', value: '300' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
                      <div className="text-2xl font-black text-slate-900">{s.value}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ========== DASHBOARD ========== */}
            {page === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-1">Overview</div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Lender Dashboard</h2>
                  </div>
                  <button onClick={() => navigate('assess')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100">
                    <Plus size={18} strokeWidth={3} /> New Assessment
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Activity, label: 'Scored Today', value: DASHBOARD_STATS.totalApplicants.toString(), sub: '+12.5%', trend: 'up' as const },
                    { icon: TrendingUp, label: 'Avg Score', value: DASHBOARD_STATS.averageScore.toString(), sub: 'Healthy', trend: 'up' as const },
                    { icon: CheckCircle2, label: 'Approval', value: `${DASHBOARD_STATS.approvalRate}%`, sub: 'Optimized', trend: 'up' as const },
                    { icon: Shield, label: 'Bias Corrections', value: '142', sub: '+8.3%', trend: 'up' as const },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <s.icon size={18} />
                        </div>
                        <div className="text-[9px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 flex items-center gap-1">
                          <TrendingUp size={10} />{s.sub}
                        </div>
                      </div>
                      <div className="text-2xl font-black text-slate-900 tabular-nums">{s.value}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900">Assessment Volume (30D)</h3>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Daily</span></div>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={DASHBOARD_STATS.scoreHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 700 }} />
                          <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} dot={{ r: 3, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tier Dist */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900">Tier Distribution</h3>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={tierDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                            {tierDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 700 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tierDistribution.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="text-[10px] font-bold text-slate-500">{t.name} ({t.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900">Recent Assessments</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {DASHBOARD_STATS.recentAssessments.map((item, i) => (
                      <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                            item.tier === 'A' ? "bg-emerald-100 text-emerald-700" : item.tier === 'B' ? "bg-blue-100 text-blue-700" :
                            item.tier === 'C' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700")}>
                            {item.tier}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{item.name}</div>
                            <div className="text-[10px] font-medium text-slate-400">{item.time}</div>
                          </div>
                        </div>
                        <div className="text-sm font-black text-slate-900 tabular-nums">{item.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========== ASSESS (INPUT) ========== */}
            {page === 'assess' && (
              <motion.div key="assess" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div>
                  <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-1">Data Entry</div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">New Assessment</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Select a demo persona from the sidebar or enter data manually below.</p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-bold text-rose-800 text-sm">Assessment Failed</div>
                        <div className="text-rose-600 text-xs mt-0.5">{error}</div>
                      </div>
                      <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600"><X size={16} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mobile persona selector */}
                <div className="lg:hidden">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Quick Select Persona</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                    {DEMO_PERSONAS.map(p => (
                      <button key={p.id} onClick={() => handleSelectPersona(p)}
                        className={cn("flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all whitespace-nowrap",
                          selectedPersona === p.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-white text-slate-600 hover:border-emerald-200")}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Form — main area */}
                  <div className="xl:col-span-3 space-y-6">
                    {/* Name */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Applicant Name</label>
                      <input type="text" value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Grace Wambui"
                        className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-lg" />
                    </div>

                    {/* M-Pesa */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} className="text-emerald-600" />
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">M-Pesa Transactions</label>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{formData.mpesaTransactions.length}</span>
                        </div>
                        <button onClick={handleAddTransaction} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center gap-1.5">
                          <Plus size={12} strokeWidth={3} /> Add
                        </button>
                      </div>
                      {formData.mpesaTransactions.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-2">
                          <Smartphone size={32} className="text-slate-200 mx-auto" />
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No transactions</div>
                          <div className="text-[10px] text-slate-300">Select a persona from the sidebar or add manually</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formData.mpesaTransactions.map((tx, idx) => (
                            <div key={tx.id} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <select value={tx.type} onChange={e => { const n = [...formData.mpesaTransactions]; n[idx].type = e.target.value as any; setFormData(prev => ({ ...prev, mpesaTransactions: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none">
                                {['Paybill','Buy Goods','Send Money','Receive Money','Withdraw','Airtime','Fuliza'].map(t => <option key={t}>{t}</option>)}
                              </select>
                              <input type="number" placeholder="Amount" value={tx.amount || ''} onChange={e => { const n = [...formData.mpesaTransactions]; n[idx].amount = Number(e.target.value); setFormData(prev => ({ ...prev, mpesaTransactions: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none" />
                              <input type="date" value={tx.date} onChange={e => { const n = [...formData.mpesaTransactions]; n[idx].date = e.target.value; setFormData(prev => ({ ...prev, mpesaTransactions: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none" />
                              <input type="text" placeholder="Counterparty" value={tx.counterparty} onChange={e => { const n = [...formData.mpesaTransactions]; n[idx].counterparty = e.target.value; setFormData(prev => ({ ...prev, mpesaTransactions: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none col-span-2 lg:col-span-2" />
                              <button onClick={() => setFormData(prev => ({ ...prev, mpesaTransactions: prev.mpesaTransactions.filter(t => t.id !== tx.id) }))}
                                className="text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Utility Records */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-emerald-600" />
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Utility Payments</label>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{formData.utilityRecords.length}</span>
                        </div>
                        <button onClick={handleAddUtility} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center gap-1.5">
                          <Plus size={12} strokeWidth={3} /> Add
                        </button>
                      </div>
                      {formData.utilityRecords.length === 0 ? (
                        <div className="p-6 border-2 border-dashed border-slate-100 rounded-xl text-center">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No utility records</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formData.utilityRecords.map((util, idx) => (
                            <div key={util.id} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <input type="text" placeholder="Provider (KPLC)" value={util.provider} onChange={e => { const n = [...formData.utilityRecords]; n[idx].provider = e.target.value; setFormData(prev => ({ ...prev, utilityRecords: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none" />
                              <input type="date" value={util.date} onChange={e => { const n = [...formData.utilityRecords]; n[idx].date = e.target.value; setFormData(prev => ({ ...prev, utilityRecords: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none" />
                              <input type="number" placeholder="Amount" value={util.amount || ''} onChange={e => { const n = [...formData.utilityRecords]; n[idx].amount = Number(e.target.value); setFormData(prev => ({ ...prev, utilityRecords: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none" />
                              <select value={util.status} onChange={e => { const n = [...formData.utilityRecords]; n[idx].status = e.target.value as any; setFormData(prev => ({ ...prev, utilityRecords: n })); }}
                                className="p-2.5 rounded-lg bg-white text-xs font-bold border border-slate-100 focus:border-emerald-500 focus:outline-none">
                                <option value="active">Active</option>
                                <option value="disconnected">Disconnected</option>
                                <option value="restored">Restored</option>
                              </select>
                              <button onClick={() => setFormData(prev => ({ ...prev, utilityRecords: prev.utilityRecords.filter(u => u.id !== util.id) }))}
                                className="text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SMS */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-emerald-600" />
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">SMS & Business Activity</label>
                      </div>
                      <textarea value={formData.businessSms}
                        onChange={e => setFormData(prev => ({ ...prev, businessSms: e.target.value }))}
                        placeholder="Paste M-Pesa SMS confirmations, business invoices, chama notifications..."
                        rows={4}
                        className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium resize-none" />
                    </div>
                  </div>

                  {/* Right sidebar — Run button + summary */}
                  <div className="xl:col-span-1 space-y-4">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-5 sticky top-20">
                      <div className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">AI Engine</div>
                      <div className="space-y-2">
                        {['Cashflow Intelligence (35%)', 'Obligation Fulfilment (30%)', 'Network & Commerce (20%)', 'Behavioural Signals (15%)'].map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{m}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-800 pt-4 space-y-2">
                        <div className="flex justify-between text-xs"><span className="text-slate-500">Transactions</span><span className="font-black">{formData.mpesaTransactions.length}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-500">Utilities</span><span className="font-black">{formData.utilityRecords.length}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-500">SMS Data</span><span className="font-black">{formData.businessSms ? 'Yes' : 'No'}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-500">Volume</span><span className="font-black text-emerald-400">KES {formData.mpesaTransactions.reduce((s, t) => s + t.amount, 0).toLocaleString()}</span></div>
                      </div>
                      <button onClick={handleSubmit} disabled={loading || !formData.name}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-sm hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/30">
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <>Run Assessment <Zap size={16} fill="currentColor" /></>}
                      </button>
                    </div>
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-emerald-600" />
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Ethical AI</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">5 bias corrections active. No contact lists. No hard declines. Full explainability.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ========== RESULTS ========== */}
            {page === 'results' && assessment && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-1">Assessment Complete</div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Credit Report</h2>
                    <p className="text-slate-500 text-sm font-medium">Subject: <span className="font-bold text-slate-900">{formData.name}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportPDF('results-content', `ACS-KE_${formData.name.replace(/\s+/g, '_')}.pdf`)}
                      className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2">
                      <Download size={14} /> PDF
                    </button>
                    <button onClick={() => { setAssessment(null); navigate('assess'); }}
                      className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2">
                      <Plus size={14} /> New
                    </button>
                  </div>
                </div>

                <div id="results-content" className="space-y-6">
                  {/* Score + Recommendation row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Score */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 relative overflow-hidden">
                      <ScoreGauge score={assessment.score} size="sm" />
                      <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                        assessment.tier === 'A' ? "bg-emerald-100 text-emerald-700" : assessment.tier === 'B' ? "bg-blue-100 text-blue-700" :
                        assessment.tier === 'C' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700")}>
                        {assessment.tier === 'A' ? <Star size={12} /> : assessment.tier === 'B' ? <TrendingUp size={12} /> : assessment.tier === 'C' ? <AlertCircle size={12} /> : <AlertTriangle size={12} />}
                        Tier {assessment.tier}
                      </div>
                      {assessment.tierDescription && <p className="text-[10px] text-slate-400 font-medium px-2">{assessment.tierDescription}</p>}
                    </div>

                    {/* Recommendation */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-4">
                        <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-1"><Zap size={10} fill="currentColor" /> Recommendation</div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Max Limit</div>
                          <div className="text-3xl font-black tabular-nums mt-1">KES {assessment.recommendation.maxLoanAmount.toLocaleString()}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                          <div><div className="text-[9px] text-slate-500 font-bold uppercase">Tenor</div><div className="font-black text-sm mt-0.5">{assessment.recommendation.tenor}</div></div>
                          <div><div className="text-[9px] text-slate-500 font-bold uppercase">Rate</div><div className="font-black text-sm mt-0.5 text-emerald-400">{assessment.recommendation.interestRate}</div></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-600 rounded-full blur-2xl opacity-20" />
                    </div>

                    {/* Decision */}
                    <div className={cn("p-6 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden",
                      assessment.recommendation.decision === 'Auto-Approve' ? "bg-emerald-600" :
                      assessment.recommendation.decision === 'Approve with Monitoring' ? "bg-blue-600" :
                      assessment.recommendation.decision === 'Conditional Approval' ? "bg-amber-600" : "bg-violet-600")}>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Decision</div>
                        <div className="text-xl font-black mt-2">{assessment.recommendation.decision}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-6 bg-white/10 p-3 rounded-xl">
                        <CheckCircle2 size={18} />
                        <span className="text-xs font-bold">Assessment verified by AI engine</span>
                      </div>
                      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>
                  </div>

                  {/* Scorecard */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                      <Activity size={16} className="text-emerald-600" />
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">Feature Scorecard</h3>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {assessment.modules.map(mod => (
                        <div key={mod.name}>
                          <button onClick={() => setExpandedModules(p => ({ ...p, [mod.name]: !p[mod.name] }))}
                            className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-slate-900 truncate">{mod.name}</span>
                                {expandedModules[mod.name] ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{mod.insights[0]}</div>
                            </div>
                            <div className="text-right flex-shrink-0 w-16">
                              <div className="font-black text-slate-900 tabular-nums">{mod.score}</div>
                              <div className="text-[9px] font-bold text-slate-400">{mod.weight}%</div>
                            </div>
                            <div className="w-24 flex-shrink-0 hidden sm:block">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(mod.score / 850) * 100}%` }} transition={{ duration: 1, delay: 0.5 }}
                                    className={cn("h-full rounded-full", mod.score >= 700 ? "bg-emerald-500" : mod.score >= 500 ? "bg-blue-500" : mod.score >= 350 ? "bg-amber-500" : "bg-rose-500")} />
                                </div>
                                <span className="text-[9px] font-black text-slate-500 tabular-nums w-6 text-right">{mod.contribution}</span>
                              </div>
                            </div>
                          </button>
                          <AnimatePresence>
                            {expandedModules[mod.name] && mod.insights.length > 1 && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-5 pb-4 space-y-1.5">
                                  {mod.insights.slice(1).map((insight, i) => (
                                    <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                                      <Eye size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-[11px] font-medium text-slate-600">{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bias Adjustments */}
                  {assessment.biasAdjustments && assessment.biasAdjustments.length > 0 && (
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 rounded-2xl border border-violet-200 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center"><Shield size={16} className="text-white" /></div>
                        <div>
                          <h3 className="font-black text-sm text-slate-900">Bias Corrections Applied</h3>
                          <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">Ethical AI Safeguards</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {assessment.biasAdjustments.map((adj, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-violet-100">
                            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-violet-600" />
                            <span className="text-xs font-medium text-slate-700">{adj}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Narrative */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-600" />
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">AI Narrative</h3>
                    </div>
                    <div className="space-y-4">
                      {assessment.narrative.map((para, i) => (
                        <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
                          className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">{para}</motion.p>
                      ))}
                    </div>
                  </div>

                  {/* Raw Data */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <button onClick={() => setShowHistory(!showHistory)} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Smartphone size={16} className="text-emerald-600" />
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">Transaction Data</h3>
                      </div>
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg uppercase tracking-wider">
                        {showHistory ? 'Hide' : 'Show'} ({formData.mpesaTransactions.length})
                      </span>
                    </button>
                    <AnimatePresence>
                      {showHistory && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                  <th className="px-5 py-3">Date</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Counterparty</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-right">Balance</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {formData.mpesaTransactions.map((tx, i) => (
                                  <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-400 font-bold tabular-nums text-xs">{tx.date}</td>
                                    <td className="px-5 py-3">
                                      <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                        tx.type === 'Receive Money' ? "bg-emerald-100 text-emerald-700" :
                                        tx.type === 'Fuliza' ? "bg-rose-100 text-rose-700" :
                                        "bg-slate-100 text-slate-600")}>{tx.type}</span>
                                    </td>
                                    <td className="px-5 py-3 font-bold text-xs text-slate-900">{tx.counterparty}</td>
                                    <td className={cn("px-5 py-3 text-right font-black tabular-nums text-xs", tx.type === 'Receive Money' ? "text-emerald-600" : "text-slate-900")}>
                                      {tx.type === 'Receive Money' ? '+' : '-'}{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3 text-right font-medium text-slate-400 tabular-nums text-xs">{tx.balance.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feedback */}
                  <div className="bg-emerald-900 text-white p-6 sm:p-8 rounded-2xl space-y-6 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="text-emerald-400" />
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-400">Applicant Feedback</h3>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] font-black bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">EN</span>
                        <span className="text-[9px] font-black bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">SW</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      <div className="space-y-5">
                        <p className="text-base sm:text-lg text-emerald-50 font-bold leading-relaxed">{assessment.feedback.english}</p>
                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">90-Day Actions</div>
                        <ul className="space-y-2">
                          {assessment.feedback.actions.map((a, i) => (
                            <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}
                              className="flex items-start gap-2 text-xs text-emerald-200 font-medium">
                              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-400" />{a}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-5 md:border-l md:border-emerald-800 md:pl-8">
                        <p className="text-base sm:text-lg text-emerald-100 font-bold leading-relaxed italic">{assessment.feedback.kiswahili}</p>
                        <div className="p-3 bg-emerald-800/50 rounded-xl border border-emerald-700/30 text-center">
                          <div className="text-[11px] text-emerald-300 font-black">Thamani yako ya fedha inakua.</div>
                          <div className="text-[9px] text-emerald-400/70 font-bold mt-0.5">Your financial value is growing.</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-800 rounded-full blur-3xl opacity-20" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
