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
  ChevronDown,
  ChevronUp,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
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
  Sparkles
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

// --- Animated Counter Hook ---
function useAnimatedCounter(target: number, duration = 2000, enabled = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    const startTime = performance.now();
    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);
  return count;
}

// --- Score Gauge ---
const ScoreGauge = ({ score, animated = true }: { score: number; animated?: boolean }) => {
  const displayScore = useAnimatedCounter(score, 2000, animated);
  const tierColor = score >= 750 ? '#059669' : score >= 620 ? '#2563eb' : score >= 480 ? '#d97706' : '#e11d48';
  const data = [
    { value: score - 300 },
    { value: 850 - score },
  ];

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
            <Cell fill={tierColor} />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-black text-slate-900 tabular-nums"
        >
          {animated ? displayScore : score}
        </motion.span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Credit Score Index</span>
      </div>
    </div>
  );
};

// --- Stat Card ---
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

// --- Analysis Loading Screen ---
const ANALYSIS_STAGES = [
  { label: 'Ingesting M-Pesa transaction ledger', icon: Smartphone, duration: 2000 },
  { label: 'Analyzing cashflow patterns & income regularity', icon: BarChart3, duration: 3000 },
  { label: 'Verifying utility payment history', icon: Zap, duration: 2500 },
  { label: 'Detecting business activity & network breadth', icon: Globe, duration: 3000 },
  { label: 'Applying bias correction engine', icon: Shield, duration: 2000 },
  { label: 'Generating credit assessment report', icon: FileText, duration: 2000 },
];

const AnalysisLoadingScreen = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage(prev => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center"
    >
      <div className="max-w-lg w-full mx-6 text-center space-y-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">AI Analysis in Progress</h3>
          <p className="text-slate-400 text-sm font-medium">Powered by Google Gemini</p>
        </div>
        <div className="space-y-3 text-left">
          {ANALYSIS_STAGES.map((stage, i) => {
            const StageIcon = stage.icon;
            const isActive = i === currentStage;
            const isDone = i < currentStage;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= currentStage ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all",
                  isActive && "bg-emerald-500/10 border border-emerald-500/20",
                  isDone && "opacity-60"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  isDone ? "bg-emerald-500/20 text-emerald-400" :
                  isActive ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                )}>
                  {isDone ? <CheckCircle2 size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : <StageIcon size={16} />}
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  isDone ? "text-emerald-400" : isActive ? "text-white" : "text-slate-500"
                )}>
                  {stage.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// --- Bias Adjustment Badge ---
const BiasAdjustmentCard = ({ adjustments }: { adjustments: string[] }) => (
  <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-8 rounded-[2.5rem] border border-violet-200 space-y-6 relative overflow-hidden">
    <div className="flex items-center gap-3 relative z-10">
      <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
        <Shield size={20} className="text-white" />
      </div>
      <div>
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Bias Corrections Applied</h3>
        <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mt-0.5">Ethical AI Safeguards</p>
      </div>
    </div>
    <div className="space-y-3 relative z-10">
      {adjustments.map((adj, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + i * 0.15 }}
          className="flex items-start gap-3 p-4 bg-white/70 rounded-2xl border border-violet-100"
        >
          <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-violet-600" />
          <span className="text-sm font-medium text-slate-700">{adj}</span>
        </motion.div>
      ))}
    </div>
    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-violet-200 rounded-full blur-3xl opacity-40" />
  </div>
);

// --- PDF Export ---
async function exportPDF(elementId: string, filename: string) {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#f8fafc',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= (pageHeight - 20);

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 20);
  }

  pdf.save(filename);
}

// --- Main App ---

export default function App() {
  const [page, setPage] = useState<'landing' | 'dashboard' | 'input' | 'results'>('landing');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<CreditAssessment | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicantData>({
    name: '',
    mpesaTransactions: [],
    utilityRecords: [],
    businessSms: ''
  });

  const handleSelectPersona = (persona: Persona) => {
    setFormData(persona.data);
    setError(null);
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
    setError(null);
    try {
      const result = await generateAssessment(formData);
      setAssessment(result);
      setPage('results');
    } catch (err: any) {
      setError(err?.message || "Failed to generate assessment. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportPDF('results-container', `ACS-KE_${formData.name.replace(/\s+/g, '_')}_Report.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const toggleModule = (name: string) => {
    setExpandedModules(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Tier distribution data for dashboard
  const tierDistribution = [
    { name: 'Tier A', value: 28, color: '#059669' },
    { name: 'Tier B', value: 35, color: '#2563eb' },
    { name: 'Tier C', value: 25, color: '#d97706' },
    { name: 'Tier D', value: 12, color: '#e11d48' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && <AnalysisLoadingScreen />}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('landing')}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="text-xl font-bold tracking-tight">ACS-KE</span>
            <span className="hidden sm:inline text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alternative Credit Scorer</span>
          </div>
          <div className="flex items-center gap-4">
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
                onClick={() => setPage(page === 'results' ? 'input' : page === 'input' ? 'dashboard' : 'landing')}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ========== LANDING PAGE ========== */}
          {page === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]"
            >
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                    <Zap size={12} fill="currentColor" />
                    Safaricom De&#123;c0&#125;de 2025
                  </div>
                  <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
                    SCORING THE <br />
                    <span className="text-emerald-600">UNBANKED.</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                    ACS-KE transforms M-Pesa transaction patterns, utility payment records, and SMS business activity into actionable credit scores for Kenya's 19 million credit-invisible adults.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setPage('dashboard')}
                    className="bg-slate-900 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 group"
                  >
                    Launch Dashboard
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setPage('input')}
                    className="bg-emerald-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 flex items-center gap-3 group"
                  >
                    Try Demo
                    <Smartphone size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* How It Works */}
                <div className="pt-8 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">How It Works</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: Smartphone, title: 'Ingest', desc: 'M-Pesa statements, utility bills, SMS records' },
                      { icon: Sparkles, title: 'Analyze', desc: '4-module AI engine with bias correction' },
                      { icon: FileText, title: 'Score', desc: 'Credit tier, loan limit, bilingual feedback' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <step.icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">{step.title}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-slate-200">
                  <div>
                    <div className="text-2xl font-black text-slate-900">19M+</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Target Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">&lt;30s</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analysis Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">5</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bias Guards</div>
                  </div>
                </div>
              </div>

              {/* Right: Visual Card */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-emerald-600 rounded-[4rem] rotate-3 opacity-10 blur-3xl animate-pulse" />
                <div className="relative bg-white border border-slate-200 rounded-[3rem] shadow-2xl p-8 space-y-6 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Assessment Preview</div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Users size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-slate-900">Grace Wambui</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Trader, Gikomba</div>
                      </div>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <div className="text-4xl font-black text-emerald-700">742</div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Tier B &mdash; Near-Prime</div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Cashflow Intelligence', pct: 88, weight: '35%' },
                        { label: 'Obligation Fulfilment', pct: 92, weight: '30%' },
                        { label: 'Network Activity', pct: 72, weight: '20%' },
                        { label: 'Behavioural Signals', pct: 65, weight: '15%' },
                      ].map((mod, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>{mod.label}</span>
                            <span className="text-emerald-600">{mod.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${mod.pct}%` }}
                              transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-2xl border border-violet-100">
                      <Shield size={14} className="text-violet-600" />
                      <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">2 Bias Corrections Applied</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full opacity-10 blur-3xl" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== DASHBOARD ========== */}
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
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Lender Dashboard</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={Activity} label="Scored Today" value={DASHBOARD_STATS.totalApplicants.toString()} sub="+12.5%" trend="up" />
                <StatCard icon={TrendingUp} label="Avg Credit Score" value={DASHBOARD_STATS.averageScore.toString()} sub="Healthy" trend="up" />
                <StatCard icon={CheckCircle2} label="Approval Rate" value={`${DASHBOARD_STATS.approvalRate}%`} sub="Optimized" trend="up" />
                <StatCard icon={Shield} label="Bias Corrections" value="142" sub="+8.3%" trend="up" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Volume Analysis (30D)</h3>
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Assessments</div>
                    </div>
                  </div>
                  <div className="h-64 sm:h-72 w-full">
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

                {/* Tier Distribution */}
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Tier Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tierDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {tierDistribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {tierDistribution.map((tier, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tier.color }} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tier.name} ({tier.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Table + Personas Quick Access */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Recent Assessments</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {DASHBOARD_STATS.recentAssessments.map((item, i) => (
                      <div key={i} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
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

                {/* Demo Personas Quick Launch */}
                <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 space-y-6 relative overflow-hidden">
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-emerald-400">Quick Launch</h3>
                    <p className="text-slate-400 text-xs mt-2 font-medium">Select a persona for instant demo</p>
                  </div>
                  <div className="space-y-2">
                    {DEMO_PERSONAS.slice(0, 6).map(p => (
                      <button
                        key={p.id}
                        onClick={() => { handleSelectPersona(p); setPage('input'); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 text-xs font-black flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{p.name}</div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{p.role}, {p.location}</div>
                        </div>
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full blur-3xl opacity-10" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== INPUT PAGE ========== */}
          {page === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">Data Entry</div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Applicant Profile</h2>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">Select a <span className="text-emerald-600 font-bold">Demo Persona</span> or enter data manually.</p>
                </div>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-3"
                  >
                    <AlertTriangle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-800 text-sm">Assessment Failed</div>
                      <div className="text-rose-600 text-xs mt-1">{error}</div>
                    </div>
                    <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Personas Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {DEMO_PERSONAS.map(p => (
                  <motion.button
                    key={p.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPersona(p)}
                    className={cn(
                      "relative p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border-2 text-left transition-all group overflow-hidden",
                      formData.name === p.data.name
                        ? "border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-100"
                        : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg"
                    )}
                  >
                    <div className="relative z-10">
                      <div className="text-sm font-black text-slate-900 mb-1">{p.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{p.role}</div>
                      <div className="text-[9px] font-medium text-slate-300 mt-1 flex items-center gap-1">
                        <MapPin size={8} />{p.location}
                      </div>
                    </div>
                    {formData.name === p.data.name && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Info & M-Pesa */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. John Doe"
                        className="w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-lg"
                      />
                    </div>

                    {/* M-Pesa Transactions */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">M-Pesa Ledger</label>
                        <button onClick={handleAddTransaction} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2">
                          <Plus size={14} strokeWidth={3} /> Add
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.mpesaTransactions.map((tx, idx) => (
                          <div key={tx.id} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <select
                              value={tx.type}
                              onChange={e => {
                                const newTxs = [...formData.mpesaTransactions];
                                newTxs[idx].type = e.target.value as any;
                                setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                              }}
                              className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
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
                              placeholder="Amount (KES)"
                              value={tx.amount || ''}
                              onChange={e => {
                                const newTxs = [...formData.mpesaTransactions];
                                newTxs[idx].amount = Number(e.target.value);
                                setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                              }}
                              className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
                            />
                            <input
                              type="date"
                              value={tx.date}
                              onChange={e => {
                                const newTxs = [...formData.mpesaTransactions];
                                newTxs[idx].date = e.target.value;
                                setFormData(prev => ({ ...prev, mpesaTransactions: newTxs }));
                              }}
                              className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
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
                              className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm col-span-2"
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
                          <div className="p-8 sm:p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-2">
                            <div className="text-slate-300 flex justify-center"><Smartphone size={40} /></div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions added</div>
                            <div className="text-[10px] text-slate-300">Select a persona above or add manually</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Utility Records */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-emerald-600" />
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Utility Payment Records</label>
                      </div>
                      <button onClick={handleAddUtility} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center gap-2">
                        <Plus size={14} strokeWidth={3} /> Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.utilityRecords.map((util, idx) => (
                        <div key={util.id} className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <input
                            type="text"
                            placeholder="Provider (e.g. KPLC)"
                            value={util.provider}
                            onChange={e => {
                              const newUtils = [...formData.utilityRecords];
                              newUtils[idx].provider = e.target.value;
                              setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                            }}
                            className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
                          />
                          <input
                            type="date"
                            value={util.date}
                            onChange={e => {
                              const newUtils = [...formData.utilityRecords];
                              newUtils[idx].date = e.target.value;
                              setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                            }}
                            className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
                          />
                          <input
                            type="number"
                            placeholder="Amount (KES)"
                            value={util.amount || ''}
                            onChange={e => {
                              const newUtils = [...formData.utilityRecords];
                              newUtils[idx].amount = Number(e.target.value);
                              setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                            }}
                            className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
                          />
                          <select
                            value={util.status}
                            onChange={e => {
                              const newUtils = [...formData.utilityRecords];
                              newUtils[idx].status = e.target.value as any;
                              setFormData(prev => ({ ...prev, utilityRecords: newUtils }));
                            }}
                            className="p-2.5 sm:p-3 rounded-xl border-none bg-white text-xs font-bold shadow-sm"
                          >
                            <option value="active">Active</option>
                            <option value="disconnected">Disconnected</option>
                            <option value="restored">Restored</option>
                          </select>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, utilityRecords: prev.utilityRecords.filter(u => u.id !== util.id) }))}
                            className="text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      {formData.utilityRecords.length === 0 && (
                        <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-1">
                          <div className="text-slate-300 flex justify-center"><Zap size={32} /></div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No utility records</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SMS / Business Activity */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-emerald-600" />
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SMS & Business Activity</label>
                    </div>
                    <textarea
                      value={formData.businessSms}
                      onChange={e => setFormData(prev => ({ ...prev, businessSms: e.target.value }))}
                      placeholder="Paste M-Pesa confirmation SMS, business invoices, chama notifications, or any relevant financial activity messages..."
                      rows={5}
                      className="w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium resize-none"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">
                      Include any M-Pesa confirmation messages, business receipts, chama/SACCO notifications, or informal records that demonstrate financial activity.
                    </p>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-emerald-400">AI Scoring Engine</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Gemini analyzes <span className="text-white font-bold">velocity</span>, <span className="text-white font-bold">consistency</span>, and <span className="text-white font-bold">diversity</span> across all data points.
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: 'Cashflow Intelligence', weight: '35%' },
                        { label: 'Obligation Fulfilment', weight: '30%' },
                        { label: 'Network & Commerce', weight: '20%' },
                        { label: 'Behavioural Signals', weight: '15%' },
                      ].map((mod, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            {mod.label}
                          </div>
                          <span className="text-emerald-400 font-black">{mod.weight}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !formData.name}
                      className="w-full bg-emerald-600 text-white py-4 sm:py-5 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/40"
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

                  {/* Data Summary */}
                  <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 space-y-4">
                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Data Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">M-Pesa Entries</span>
                        <span className="text-sm font-black text-slate-900">{formData.mpesaTransactions.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">Utility Records</span>
                        <span className="text-sm font-black text-slate-900">{formData.utilityRecords.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">SMS Data</span>
                        <span className="text-sm font-black text-slate-900">{formData.businessSms ? 'Provided' : 'None'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">Total Volume</span>
                        <span className="text-sm font-black text-emerald-600">
                          KES {formData.mpesaTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-emerald-600" />
                      <h3 className="font-bold text-[10px] uppercase tracking-widest text-emerald-700">Ethical AI</h3>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                      ACS-KE applies 5 bias corrections: gender, rural, informal economy, Fuliza parity, and seasonal. No contact lists, no location tracking, no hard declines.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== RESULTS PAGE ========== */}
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
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Credit Report</h2>
                  <p className="text-slate-500 font-medium">Subject: <span className="font-bold text-slate-900">{formData.name}</span></p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportPDF}
                    className="bg-white border-2 border-slate-100 px-5 sm:px-6 py-3 rounded-2xl font-bold text-slate-700 hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">Download</span> PDF
                  </button>
                  <button
                    onClick={() => { setAssessment(null); setPage('input'); }}
                    className="bg-slate-900 text-white px-5 sm:px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    New Search
                  </button>
                </div>
              </div>

              <div id="results-container">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Score & Recommendation */}
                  <div className="lg:col-span-1 space-y-8">
                    {/* Score Card */}
                    <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-6 relative overflow-hidden">
                      <div className="relative z-10">
                        <ScoreGauge score={assessment.score} />
                        <div className="space-y-3 mt-4">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]",
                            assessment.tier === 'A' ? "bg-emerald-100 text-emerald-700" :
                            assessment.tier === 'B' ? "bg-blue-100 text-blue-700" :
                            assessment.tier === 'C' ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          )}>
                            {assessment.tier === 'A' ? <Star size={14} /> : assessment.tier === 'B' ? <TrendingUp size={14} /> : assessment.tier === 'C' ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
                            Tier {assessment.tier} &mdash; {assessment.tier === 'A' ? 'Prime' : assessment.tier === 'B' ? 'Near-Prime' : assessment.tier === 'C' ? 'Subprime' : 'Developmental'}
                          </div>
                          {assessment.tierDescription && (
                            <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">{assessment.tierDescription}</p>
                          )}
                        </div>
                      </div>
                      <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50" />
                    </div>

                    {/* Recommendation Card */}
                    <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-6 relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                          <Zap size={14} fill="currentColor" />
                          Lending Recommendation
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Limit</div>
                          <div className="text-4xl sm:text-5xl font-black tabular-nums">KES {assessment.recommendation.maxLoanAmount.toLocaleString()}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tenor</div>
                            <div className="font-black text-lg">{assessment.recommendation.tenor}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Interest</div>
                            <div className="font-black text-lg text-emerald-400">{assessment.recommendation.interestRate}</div>
                          </div>
                        </div>
                        <div className={cn(
                          "p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-xl",
                          assessment.recommendation.decision === 'Auto-Approve' ? "bg-emerald-600 shadow-emerald-900/40" :
                          assessment.recommendation.decision === 'Approve with Monitoring' ? "bg-blue-600 shadow-blue-900/40" :
                          assessment.recommendation.decision === 'Conditional Approval' ? "bg-amber-600 shadow-amber-900/40" :
                          "bg-violet-600 shadow-violet-900/40"
                        )}>
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="text-white" size={24} />
                          </div>
                          <div className="font-black text-base sm:text-lg">{assessment.recommendation.decision}</div>
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full blur-3xl opacity-20" />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Scorecard Table with Expandable Insights */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Activity size={20} className="text-emerald-600" />
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Feature Scorecard</h3>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Click to expand insights</div>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {assessment.modules.map(mod => (
                          <div key={mod.name}>
                            <button
                              onClick={() => toggleModule(mod.name)}
                              className="w-full p-5 sm:p-6 flex items-center gap-4 sm:gap-6 hover:bg-slate-50 transition-colors text-left"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="font-black text-slate-900 text-sm sm:text-base truncate">{mod.name}</div>
                                  {expandedModules[mod.name] ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 truncate">{mod.insights[0]}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-black text-slate-900 tabular-nums text-lg">{mod.score}</div>
                                <div className="text-[10px] font-bold text-slate-400">{mod.weight}%</div>
                              </div>
                              <div className="w-24 sm:w-32 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(mod.score / 850) * 100}%` }}
                                      transition={{ duration: 1, delay: 0.5 }}
                                      className={cn(
                                        "h-full rounded-full",
                                        mod.score >= 700 ? "bg-emerald-500" :
                                        mod.score >= 500 ? "bg-blue-500" :
                                        mod.score >= 350 ? "bg-amber-500" : "bg-rose-500"
                                      )}
                                    />
                                  </div>
                                  <span className="text-[10px] font-black text-slate-600 tabular-nums w-8 text-right">{mod.contribution}</span>
                                </div>
                              </div>
                            </button>
                            <AnimatePresence>
                              {expandedModules[mod.name] && mod.insights.length > 1 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 sm:px-8 pb-5 space-y-2">
                                    {mod.insights.slice(1).map((insight, i) => (
                                      <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                                        <Eye size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs font-medium text-slate-600">{insight}</span>
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
                      <BiasAdjustmentCard adjustments={assessment.biasAdjustments} />
                    )}

                    {/* AI Narrative */}
                    <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                        <Sparkles size={20} className="text-emerald-600" />
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">AI Narrative Assessment</h3>
                      </div>
                      <div className="space-y-5 text-slate-600 leading-relaxed font-medium relative z-10">
                        {assessment.narrative.map((para, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.2 }}
                            className="text-base sm:text-lg"
                          >
                            {para}
                          </motion.p>
                        ))}
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full p-6 sm:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone size={20} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Raw Transaction Data</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {showHistory ? "Collapse" : "Expand"} ({formData.mpesaTransactions.length})
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
                                    <th className="px-6 sm:px-8 py-4">Date</th>
                                    <th className="px-6 sm:px-8 py-4">Type</th>
                                    <th className="px-6 sm:px-8 py-4">Counterparty</th>
                                    <th className="px-6 sm:px-8 py-4 text-right">Amount</th>
                                    <th className="px-6 sm:px-8 py-4 text-right">Balance</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {formData.mpesaTransactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 sm:px-8 py-4 text-slate-400 font-bold tabular-nums">{tx.date}</td>
                                      <td className="px-6 sm:px-8 py-4">
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
                                      <td className="px-6 sm:px-8 py-4 font-black text-slate-900">{tx.counterparty}</td>
                                      <td className={cn(
                                        "px-6 sm:px-8 py-4 text-right font-black tabular-nums",
                                        tx.type === 'Receive Money' ? "text-emerald-600" : "text-slate-900"
                                      )}>
                                        {tx.type === 'Receive Money' ? '+' : '-'}{tx.amount.toLocaleString()}
                                      </td>
                                      <td className="px-6 sm:px-8 py-4 text-right font-bold text-slate-400 tabular-nums">{tx.balance.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bilingual Feedback Card */}
                    <div className="bg-emerald-900 text-white p-8 sm:p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <Heart size={18} className="text-emerald-400" />
                          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-emerald-400">Applicant Feedback</h3>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-black bg-emerald-800 text-emerald-200 px-3 py-1 rounded-lg">EN</span>
                          <span className="text-[10px] font-black bg-emerald-800 text-emerald-200 px-3 py-1 rounded-lg">SW</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 relative z-10">
                        <div className="space-y-6">
                          <p className="text-lg sm:text-xl text-emerald-50 font-bold leading-relaxed">{assessment.feedback.english}</p>
                          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Actions to Improve in 90 Days</div>
                          <ul className="space-y-3">
                            {assessment.feedback.actions.map((action, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 + i * 0.15 }}
                                className="flex items-start gap-3 text-sm text-emerald-200 font-medium"
                              >
                                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                                {action}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-6 md:border-l md:border-emerald-800 md:pl-8 lg:pl-12">
                          <p className="text-lg sm:text-xl text-emerald-100 font-bold leading-relaxed italic">{assessment.feedback.kiswahili}</p>
                          <div className="p-4 bg-emerald-800/50 rounded-2xl border border-emerald-700/30 mt-6">
                            <div className="text-[11px] text-emerald-300 font-black tracking-wide text-center">
                              Thamani yako ya fedha inakua.
                            </div>
                            <div className="text-[10px] text-emerald-400/70 font-bold tracking-wider text-center mt-1">
                              Your financial value is growing.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-20" />
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold tracking-tight">ACS-KE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1"><Shield size={12} /> No Contact List Scoring</span>
            <span className="flex items-center gap-1"><Heart size={12} /> No Hard Declines</span>
            <span className="flex items-center gap-1"><Eye size={12} /> Full Explainability</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 text-center">
            Safaricom De&#123;c0&#125;de 2025 &bull; Built by Erick Oluga Aboge
          </div>
        </div>
      </footer>
    </div>
  );
}
