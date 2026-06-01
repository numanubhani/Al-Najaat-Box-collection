/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { DonationBox, IssueReport, BoxDemand, ExpenseRecord } from '../types';
import {
  Coins,
  AlertTriangle,
  PlusSquare,
  History,
  User,
  ScanLine,
  Camera,
  X,
  FileCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Building,
  ArrowLeft,
  ChevronRight,
  Info,
  MapPin,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Receipt,
  Menu,
  ShieldCheck,
  Map,
  DollarSign
} from 'lucide-react';

export const CollectorView: React.FC = () => {
  const {
    donationBoxes,
    addCollection,
    addIssueReport,
    addBoxDemand,
    collections,
    collectors,
    expenses,
    addExpense
  } = useNGOStore();

  // Current Logger defaults to COL-001 (John Smith) for high fidelity simulation
  const mockCollectorId = 'COL-001';
  const mockCollectorName = 'John Smith';

  const [activeView, setActiveView] = useState<'dashboard' | 'scan' | 'issue' | 'demand' | 'history' | 'profile' | 'expense'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<'pending' | 'all'>('pending');

  // Success states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Expense Form state
  const [expenseCategory, setExpenseCategory] = useState<'Petrol' | 'Bike Puncture' | 'Food' | 'Hardware' | 'Other'>('Petrol');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }
    if (!expenseDescription.trim()) {
      alert('Please provide a short description or receipt note.');
      return;
    }
    
    addExpense({
      category: expenseCategory,
      amount: amountNum,
      description: expenseDescription
    });
    
    setSuccessMessage(`Successfully registered expense claim: $${amountNum.toFixed(2)} for ${expenseCategory}!`);
    setExpenseAmount('');
    setExpenseDescription('');
    setActiveView('dashboard');
  };

  // ----------------------------------------------------
  // SCREEN: SCAN QR & RECORD MONEY
  // ----------------------------------------------------
  const [scanStep, setScanStep] = useState<'camera' | 'form'>('camera');
  const [scannedBox, setScannedBox] = useState<DonationBox | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Form Fields
  const [collectAmount, setCollectAmount] = useState('');
  const [collectNotes, setCollectNotes] = useState('');

  // Play scan success sound utilizing browser AudioContext
  const playScanSuccessSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playChime = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };
      
      playChime(987.77, 0, 0.12); // B5 note (987.77 Hz)
      playChime(1318.51, 0.06, 0.2); // E6 note (1318.51 Hz)
    } catch (error) {
      console.warn('Scan beep audio playback failed', error);
    }
  };

  // Simulate Webcam Scanning
  const handleSimulateScan = (boxId: string) => {
    setIsScanning(true);
    setTimeout(() => {
      const box = donationBoxes.find((b) => b.id === boxId);
      if (box) {
        setScannedBox(box);
        setScanStep('form');
        setCollectAmount('');
        setCollectNotes('');
        playScanSuccessSound();
      }
      setIsScanning(false);
    }, 1200);
  };

  // Submit collected cash
  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBox || !collectAmount) return;

    const amountNum = parseFloat(collectAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid donation yield amount.');
      return;
    }

    // Call state engine API proxy
    addCollection({
      donorName: scannedBox.donorName,
      address: scannedBox.address,
      boxId: scannedBox.id,
      collectorName: mockCollectorName,
      collectorId: mockCollectorId,
      amount: amountNum,
      notes: collectNotes || undefined,
    });

    setSuccessMessage(`Successfully recorded $${amountNum.toFixed(2)} collected from Box ${scannedBox.id}!`);
    setActiveView('dashboard');
    resetScanFlow();
  };

  const resetScanFlow = () => {
    setScanStep('camera');
    setScannedBox(null);
    setCollectAmount('');
    setCollectNotes('');
  };

  // ----------------------------------------------------
  // SCREEN: REPORT ISSUE
  // ----------------------------------------------------
  const [issueBoxId, setIssueBoxId] = useState('');
  const [issueType, setIssueType] = useState<IssueReport['issueType']>('Damaged Box');
  const [issueDesc, setIssueDesc] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBoxId || !issueDesc) {
      alert('Please provide the Box ID and issue description.');
      return;
    }

    addIssueReport({
      boxId: issueBoxId,
      issueType,
      description: issueDesc,
      photoUrl: photoUploaded ? 'https://via.placeholder.com/150' : undefined,
    });

    setSuccessMessage(`Incident Filed! Operational ticket registered for Box ${issueBoxId}.`);
    setActiveView('dashboard');
    
    // Reset Form
    setIssueBoxId('');
    setIssueType('Damaged Box');
    setIssueDesc('');
    setPhotoUploaded(false);
  };

  // ----------------------------------------------------
  // SCREEN: NEW BOX DEMAND
  // ----------------------------------------------------
  const [demandLocation, setDemandLocation] = useState('');
  const [demandAddress, setDemandAddress] = useState('');
  const [demandCity, setDemandCity] = useState('');
  const [demandContactPerson, setDemandContactPerson] = useState('');
  const [demandContactPhone, setDemandContactPhone] = useState('');
  const [demandTraffic, setDemandTraffic] = useState('Moderate (100-500/day)');
  const [demandNotes, setDemandNotes] = useState('');

  const handleDemandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandLocation || !demandAddress || !demandCity || !demandContactPerson || !demandContactPhone) {
      alert('Please fill out all required fields.');
      return;
    }

    addBoxDemand({
      suggestedLocation: demandLocation,
      address: demandAddress,
      city: demandCity,
      contactPerson: demandContactPerson,
      contactNumber: demandContactPhone,
      estimatedTraffic: demandTraffic,
      notes: demandNotes || undefined,
    });

    setSuccessMessage(`Placement proposal submitted! Admin notified of proposed spot at "${demandLocation}".`);
    setActiveView('dashboard');

    // Reset Form
    setDemandLocation('');
    setDemandAddress('');
    setDemandCity('');
    setDemandContactPerson('');
    setDemandContactPhone('');
    setDemandTraffic('Moderate (100-500/day)');
    setDemandNotes('');
  };

  // ----------------------------------------------------
  // SCREEN: COLLECTION HISTORY
  // ----------------------------------------------------
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Today' | 'Weekly' | 'Monthly'>('All');

  const myCollections = collections.filter(c => c.collectorId === mockCollectorId);

  // Dynamic monthly routing calculations for June 2026
  const currentMonthPrefix = '2026-06';
  const myAssignedBoxes = donationBoxes.filter(box => box.collectorId === mockCollectorId);
  const myCollectedThisMonth = collections.filter(c => c.collectorId === mockCollectorId && c.date.startsWith(currentMonthPrefix));
  const myCollectedBoxIdsThisMonth = myCollectedThisMonth.map(c => c.boxId);

  const pendingUncollectedBoxes = myAssignedBoxes.filter(box => !myCollectedBoxIdsThisMonth.includes(box.id));
  const collectedBoxesThisMonth = myAssignedBoxes.filter(box => myCollectedBoxIdsThisMonth.includes(box.id));

  const getCollectionForBoxThisMonth = (boxId: string) => {
    return myCollectedThisMonth.find(c => c.boxId === boxId);
  };

  const filteredHistory = myCollections.filter((item) => {
    const matchesSearch =
      item.boxId.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.donorName.toLowerCase().includes(historySearch.toLowerCase());

    const itemDate = new Date(item.date);
    const today = new Date('2026-06-01'); // matching metadata
    const diffTime = Math.abs(today.getTime() - itemDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (historyFilter === 'Today') {
      return matchesSearch && (item.date === '2026-06-01' || item.date === '2026-05-31');
    }
    if (historyFilter === 'Weekly') {
      return matchesSearch && diffDays <= 7;
    }
    if (historyFilter === 'Monthly') {
      return matchesSearch && diffDays <= 30;
    }

    return matchesSearch;
  });

  // Collector credentials statistics mapping
  const profileDetails = collectors.find((c) => c.id === mockCollectorId);
  const totalMyCollectionsSum = myCollections.reduce((acc, curr) => acc + curr.amount, 0);
  const myExpenses = expenses.filter(e => e.collectorId === mockCollectorId);
  const totalMyExpensesSum = myExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const navigationItems = [
    { id: 'dashboard', label: 'Operations Panel', icon: Coins },
    { id: 'scan', label: 'Cash Scanner', icon: ScanLine },
    { id: 'issue', label: 'Incident Dispatch', icon: AlertTriangle },
    { id: 'demand', label: 'Placement Proposal', icon: PlusSquare },
    { id: 'expense', label: 'Field Expenses', icon: Receipt },
    { id: 'history', label: 'My Collection Logs', icon: History },
    { id: 'profile', label: 'Compliance Profile', icon: User },
  ] as const;

  const viewHeaderTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Operations Control Center';
      case 'scan': return 'Cash Yield QR Simulator';
      case 'issue': return 'File Incident Case';
      case 'demand': return 'Propose Box Installation';
      case 'expense': return 'Field Reimbursement Log';
      case 'history': return 'My Cleared Records Ledger';
      case 'profile': return 'Collector Compliance Profile';
      default: return 'Field Collector Companion';
    }
  };

  const getActiveTabTitle = () => {
    return navigationItems.find(item => item.id === activeView)?.label || 'Operations';
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-screen text-slate-800 dark:text-zinc-100 bg-[#F4F7FA] dark:bg-black transition-colors duration-200">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-200/20 dark:bg-sky-950/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-200/40 dark:bg-slate-900/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* MOBILE HEADER TAB BAR OR DRAWER TRIGGER */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-zinc-300 focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-sky-600 dark:text-sky-400 block uppercase font-bold">ECOGROWTH FIELD</span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewHeaderTitle()}</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/50 py-1 px-2.5 rounded-full border border-sky-100 dark:border-sky-900/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300">Online</span>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-45 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* NAV SIDEBAR - Persistent on Desktop, Sliding Drawer on Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-black border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-250 ease-in-out md:static md:translate-x-0 shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col flex-grow">
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-md font-bold">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-850 dark:text-zinc-100 tracking-tight leading-none">EcoGrowth Field</h3>
                <span className="text-[10px] font-mono tracking-widest text-sky-600 dark:text-sky-400 font-bold mt-1.5 block uppercase">Collector Node</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 dark:text-zinc-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connected Collector Card */}
          <div className="mx-4 my-6 p-4 bg-[#F8FAFC] dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-850 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow">
              JS
            </div>
            <div>
              <strong className="text-xs font-extrabold text-slate-900 dark:text-white block leading-none">{mockCollectorName}</strong>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mt-1">ID: {mockCollectorId}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 py-0.5 px-1.5 rounded-md font-mono uppercase font-bold inline-block mt-1.5">
                Compliance Pass
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-grow">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMobileMenuOpen(false);
                    if (item.id === 'scan') resetScanFlow();
                  }}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-extrabold tracking-wide text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 shadow-sm border border-sky-100 dark:border-sky-950'
                      : 'text-slate-500 dark:text-zinc-400 hover:bg-[#F8FAFC] dark:hover:bg-zinc-950 hover:text-slate-800 dark:hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Audit Details */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-black flex flex-col gap-1 text-[10px] text-zinc-455 font-mono">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Shift Date: June 1, 2026</span>
          </div>
          <span className="text-zinc-400 mt-0.5">Django Server Node: Operational</span>
        </div>
      </aside>

      {/* MAIN WORKSPACE WRAPPER */}
      <main className="flex-grow p-4 md:p-8 flex flex-col relative overflow-y-auto max-h-screen">
        
        {/* DESKTOP HERO HEADER (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{viewHeaderTitle()}</h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">Field collector workspace for securely checking QR sensors and dispatching box collections.</p>
          </div>
          
          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-900/50 py-1.5 px-3 rounded-lg font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Licensed NGO Agent
            </span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 py-1.5 px-3 rounded-lg font-bold">
              ● Connected
            </span>
          </div>
        </div>

        {/* NOTIFICATION ALERT CARDS */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl p-4 text-xs font-semibold flex items-start gap-3 mb-6 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-grow">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-[11px] text-emerald-700 underline block mt-1 hover:text-emerald-950 font-bold"
              >
                Dismiss alert
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            VIEW MAIN: DASHBOARD WITH METADATA / DUAL COLUMN
           ---------------------------------------------------- */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI Stat Cards Grid - matches Admin styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-black p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-mono">Monthly Shift Total</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">${totalMyCollectionsSum.toFixed(2)}</h3>
                  <p className="text-[10px] text-slate-550 dark:text-zinc-400 mt-1 font-mono">My secure processed payouts</p>
                </div>
              </div>

              <div className="bg-white dark:bg-black p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-mono">Assigned Box Assets</span>
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {donationBoxes.filter(box => box.collectorId === mockCollectorId).length} Active
                  </h3>
                  <p className="text-[10px] text-slate-550 dark:text-zinc-400 mt-1 font-mono">Shops in Karachi auto-route</p>
                </div>
              </div>

              <div className="bg-white dark:bg-black p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-mono">Claims Filed</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-55 text-amber-600 flex items-center justify-center bg-amber-50 dark:bg-amber-950/20">
                    <Receipt className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">${totalMyExpensesSum.toFixed(2)}</h3>
                  <p className="text-[10px] text-slate-550 dark:text-zinc-400 mt-1 font-mono">{myExpenses.length} files awaiting verification</p>
                </div>
              </div>

              <div className="bg-white dark:bg-black p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3 text-slate-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-mono">Compliance rating</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-605 flex items-center justify-center font-bold">
                    A+
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white">Passing</h3>
                  <p className="text-[10px] text-slate-550 dark:text-zinc-400 mt-1 font-mono">Licensed for active collection</p>
                </div>
              </div>
            </div>

            {/* DUAL WORKSPACE PANEL COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           {/* PRIMARY COLS: MY ASSIGNED BOXES AUTO-ROUTE (Left Area) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-805 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-650 flex items-center justify-center">
                        <Map className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">My Assigned Boxes (This Month)</h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Verify coordinates, dial shops or process cash collection yields.</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-305 py-1 px-3 rounded-md font-mono uppercase border border-sky-150 dark:border-sky-900/40 self-start sm:self-center">
                      Auto-routed Map List
                    </span>
                  </div>

                  {/* Monthly Shift Routine Progress bar */}
                  <div className="mb-6 p-4 bg-sky-50 hover:bg-sky-100/50 dark:bg-sky-950/15 dark:hover:bg-sky-950/25 border border-sky-100 dark:border-sky-900/20 rounded-xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-slate-800 dark:text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-sky-500 animate-bounce" /> Current Collection Routine Progress
                      </span>
                      <span className="text-xs font-mono font-black text-sky-700 dark:text-sky-400">
                        {myCollectedBoxIdsThisMonth.length} / {myAssignedBoxes.length} boxes cleared
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-sky-600 dark:bg-sky-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${myAssignedBoxes.length > 0 ? (myCollectedBoxIdsThisMonth.length / myAssignedBoxes.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    {pendingUncollectedBoxes.length > 0 ? (
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-2 font-mono">
                        ⚠️ Attention Agent John: <strong>{pendingUncollectedBoxes.length} boxes</strong> require collection dispatch before the shift expiration.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-2 font-mono font-bold flex items-center gap-1">
                        ✨ Shift Clearance Unlocked: All assigned boxes successfully processed!
                      </p>
                    )}
                  </div>

                  {/* SUBTAB TOGGLES (Pending Stack vs Master Assigned Ledger) */}
                  <div className="flex bg-[#F1F5F9] dark:bg-zinc-950 p-1 rounded-xl gap-1 mb-5 border border-slate-200/50 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => setDashboardSubTab('pending')}
                      className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                        dashboardSubTab === 'pending'
                          ? 'bg-white dark:bg-[#070A13] text-sky-600 dark:text-sky-450 shadow-sm border border-slate-200 dark:border-slate-800'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      Pending Collection List ({pendingUncollectedBoxes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardSubTab('all')}
                      className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                        dashboardSubTab === 'all'
                          ? 'bg-white dark:bg-[#070A13] text-sky-600 dark:text-sky-450 shadow-sm border border-slate-200 dark:border-slate-800'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5 shrink-0" />
                      All Assigned Boxes Ledger ({myAssignedBoxes.length})
                    </button>
                  </div>

                  {/* COMPACT LIST ROW VIEW */}
                  <div className="space-y-3.5">
                    
                    {/* Render Pending list */}
                    {dashboardSubTab === 'pending' && (
                      <>
                        {pendingUncollectedBoxes.map((box) => (
                          <div 
                            key={box.id} 
                            className="bg-[#F8FAFC] dark:bg-zinc-950 p-4.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:border-sky-305 hover:ring-1 hover:ring-sky-500/10 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                          >
                            <div className="space-y-2 flex-grow">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-[#E0F2FE] dark:bg-sky-950 text-sky-800 dark:text-sky-305 py-0.5 px-2 rounded">
                                  {box.id}
                                </span>
                                <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${
                                  box.status === 'Active' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30' 
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-emerald-955'
                                }`}>
                                  {box.status}
                                </span>
                                <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-950 flex items-center gap-1 font-mono uppercase tracking-wide">
                                  <AlertCircle className="w-3 h-3" /> Uncollected This Cycle
                                </span>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{box.donorName}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal mt-1 flex items-start gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-sky-550 shrink-0 mt-0.5" />
                                  <span>{box.address}, {box.city}</span>
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-sky-500" />
                                  <span className="font-mono text-[10px]">Contact owner:</span>
                                </span>
                                <a href={`tel:${box.contactNumber}`} className="text-sky-600 dark:text-sky-400 hover:underline font-bold">
                                  {box.contactNumber}
                                </a>
                              </div>
                            </div>

                            {/* Responsive inline controls */}
                            <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 md:w-36 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-855">
                              <a
                                href={box.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${box.donorName} ${box.address} ${box.city}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-750 dark:text-zinc-200 font-bold rounded-xl text-[11px] text-center border border-slate-200 dark:border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <MapPin className="w-3.5 h-3.5 text-sky-600" /> Google Map
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setScannedBox(box);
                                  setScanStep('form');
                                  setActiveView('scan');
                                  setCollectAmount('');
                                  setCollectNotes('');
                                }}
                                className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-[11px] text-center transition flex items-center justify-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                <Coins className="w-3.5 h-3.5 text-white" /> Quick Cash
                              </button>
                            </div>
                          </div>
                        ))}

                        {pendingUncollectedBoxes.length === 0 && (
                          <div className="text-center py-12 bg-emerald-500/5 border border-dashed border-emerald-200 dark:border-emerald-900/30 rounded-2xl flex flex-col items-center justify-center p-6 shadow-2xs">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <strong className="text-sm font-black text-slate-900 dark:text-white block">Outstanding Shift Work!</strong>
                            <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              You have cleared every single assigned shop donation box in Dallas & Houston route targets this cycle. Well done!
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Master list of all assigned boxes */}
                    {dashboardSubTab === 'all' && (
                      <>
                        {myAssignedBoxes.map((box) => {
                          const isCollected = myCollectedBoxIdsThisMonth.includes(box.id);
                          const collectionDetails = getCollectionForBoxThisMonth(box.id);

                          return (
                            <div 
                              key={box.id} 
                              className={`p-4.5 rounded-xl border transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                                isCollected 
                                  ? 'bg-[#F0FDF4]/35 dark:bg-emerald-950/5 border-emerald-100 dark:border-emerald-950/40 hover:border-emerald-300' 
                                  : 'bg-[#F8FAFC] dark:bg-zinc-950/40 border-slate-200 dark:border-slate-850 hover:border-sky-305'
                              }`}
                            >
                              <div className="space-y-2 flex-grow">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold bg-[#E0F2FE] dark:bg-sky-950 text-sky-800 dark:text-sky-305 py-0.5 px-2 rounded">
                                    {box.id}
                                  </span>
                                  <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${
                                    box.status === 'Active' 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30' 
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-emerald-955'
                                  }`}>
                                    {box.status}
                                  </span>
                                  {isCollected ? (
                                    <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-emerald-100 dark:bg-emerald-950/55 text-emerald-800 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/40 flex items-center gap-1 font-mono uppercase tracking-wide">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Collected
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-950 flex items-center gap-1 font-mono uppercase tracking-wide animate-pulse">
                                      <Clock className="w-3 h-3 text-amber-600" /> Pending
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-0.5">
                                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">{box.donorName}</h4>
                                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal flex items-start gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <span>{box.address}, {box.city}</span>
                                  </p>
                                </div>

                                {/* Dynamic collection cycle details if true */}
                                {isCollected && collectionDetails ? (
                                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-xl text-[11px] text-slate-700 dark:text-zinc-300">
                                    <strong className="font-mono text-emerald-700 dark:text-emerald-405 font-extrabold block mb-0.5">Cleared Yield: ${collectionDetails.amount.toFixed(2)}</strong>
                                    <span>Deposited securely into backend ledger on <strong>{collectionDetails.date}</strong>.</span>
                                    {collectionDetails.notes && (
                                      <span className="block italic text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 border-t border-emerald-100/30 dark:border-emerald-900/20 pt-1.5 font-normal">
                                        Audit notes: "{collectionDetails.notes}"
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1 font-medium">
                                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="font-mono text-[10px]">Contact:</span>
                                    </span>
                                    <a href={`tel:${box.contactNumber}`} className="text-sky-600 dark:text-sky-400 hover:underline font-bold">
                                      {box.contactNumber}
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Responsive action buttons */}
                              <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 md:w-36 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-855">
                                <a
                                  href={box.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${box.donorName} ${box.address} ${box.city}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1.5 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-755 dark:text-zinc-200 font-bold rounded-xl text-[11px] text-center border border-slate-200 dark:border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Google Map
                                </a>
                                
                                {isCollected ? (
                                  <button
                                    disabled
                                    key={`all-collected-${box.id}`}
                                    className="flex-1 py-2 px-3 bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 font-black rounded-xl text-[11px] text-center cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-800"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Cleared
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setScannedBox(box);
                                      setScanStep('form');
                                      setActiveView('scan');
                                      setCollectAmount('');
                                      setCollectNotes('');
                                    }}
                                    className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl text-[11px] text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                                  >
                                    <Coins className="w-3.5 h-3.5 text-white" /> Quick Cash
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>

                {/* EXPENSES LOG SUMMARY ROW - Quick Reimbursement View */}
                <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-805 pb-3.5 mb-4">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-500" /> Recent Filed Petrol Reimbursements
                    </h3>
                    <button
                      onClick={() => setActiveView('expense')}
                      className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-bold"
                    >
                      View All Logs
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {myExpenses.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-3 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs transition">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900 dark:text-white font-black">{item.category}</strong>
                            <span className={`text-[9px] font-bold uppercase py-0.25 px-1.5 rounded-full border ${
                              item.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30' :
                              item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-amber-50 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400 border-amber-100/30 dark:border-amber-900/20'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-1">{item.description}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">${item.amount.toFixed(2)}</span>
                          <span className="block text-[9px] text-zinc-400 font-mono mt-0.5">{item.date}</span>
                        </div>
                      </div>
                    ))}

                    {myExpenses.length === 0 && (
                      <div className="text-center py-6 text-zinc-400 italic text-xs">
                        No field expense invoices registered.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SIDEBAR COL: DISPATCH OPERATIONS CONTROL (Right Area) */}
              <div className="space-y-4">
                
                {/* ADVANCED SMART SYSTEM QR SCAN CONTROLS (Demo trigger tool) */}
                <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100/30 dark:bg-sky-950/10 rounded-full blur-xl"></div>
                  
                  <div className="border-b border-slate-100 dark:border-slate-805 pb-3.5 mb-4">
                    <span className="text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block bg-sky-50 dark:bg-sky-950/50 py-0.5 px-2 rounded w-max mb-1.5 border border-sky-100/20">
                      System Simulation Tool
                    </span>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Instant QR Scan simulator</h3>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                    In the field companion app, agents aim their camera at the box's sticker. Pick a vendor below to simulate an <strong>instant camera lock</strong> beep:
                  </p>

                  <div className="space-y-2">
                    {donationBoxes.map((box) => (
                      <button
                        key={box.id}
                        onClick={() => {
                          setScannedBox(box);
                          setScanStep('form');
                          setActiveView('scan');
                          setCollectAmount('');
                          setCollectNotes('');
                          playScanSuccessSound();
                        }}
                        className="w-full p-3 bg-[#F8FAFC] dark:bg-zinc-950 hover:bg-sky-50 dark:hover:bg-sky-950/20 border border-slate-150 dark:border-slate-800 hover:border-sky-305 text-left rounded-xl transition duration-150 flex items-center justify-between text-xs cursor-pointer group"
                      >
                        <div>
                          <strong className="text-slate-800 dark:text-white block group-hover:text-sky-600 dark:group-hover:text-sky-400 transition font-bold leading-snug">{box.donorName}</strong>
                          <span className="text-[10px] text-slate-450 font-mono mt-0.5 block">{box.id} • {box.city}</span>
                        </div>
                        <ScanLine className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-805 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-400 leading-snug font-medium">Any scan automatically triggers the physical chime sound effect in compliance with security guidelines.</span>
                  </div>
                </div>

                {/* DISPATCH ACTION TILES */}
                <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-805 pb-3 mb-3">
                    Fast Despatch shortcuts
                  </h3>

                  <button
                    onClick={() => setActiveView('issue')}
                    className="w-full p-4 bg-rose-500/5 hover:bg-rose-55 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-950/30 text-left rounded-xl transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">Report Box Issue</strong>
                      <span className="text-[10px] text-zinc-500 leading-none block">File damaged sticky doors or rusty lock incidents</span>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                  </button>

                  <button
                    onClick={() => setActiveView('demand')}
                    className="w-full p-4 bg-sky-500/5 hover:bg-sky-500/10 border border-sky-200 dark:border-sky-950/30 text-left rounded-xl transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <strong className="text-xs font-extrabold text-slate-900 dark:text-white block">Propose Installation</strong>
                      <span className="text-[10px] text-zinc-500 leading-none block">Propose high foot-traffic spots for box placement</span>
                    </div>
                    <PlusSquare className="w-5 h-5 text-sky-600 shrink-0" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            VIEW SCAN: SIMULATED OR MANUAL CASH ENTRY
           ---------------------------------------------------- */}
        {activeView === 'scan' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-black p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md w-full">
            
            {scanStep === 'camera' && (
              <div className="space-y-6">
                <div className="relative aspect-square sm:aspect-video w-full bg-zinc-950 rounded-2xl border-4 border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-center">
                  <div className={`absolute left-0 w-full h-[3px] bg-sky-500 shadow-[0_0_12px_#0284c7] ${isScanning ? 'top-1/2 -translate-y-1/2 animate-bounce' : 'top-10'}`}></div>

                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-sky-500 rounded-tl"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-sky-500 rounded-tr"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-sky-500 rounded-bl"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-sky-500 rounded-br"></div>

                  <div className="p-4 relative z-10 text-white">
                    <Camera className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                    {isScanning ? (
                      <span className="text-xs text-sky-400 font-mono tracking-widest uppercase animate-pulse font-bold">
                        Decoding Secure Holographic QR Sticker...
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-sm font-black text-zinc-100 block">Position Sticker Under Light</span>
                        <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
                          EcoGrowth secure boxes are labeled with high-contrast sticker values. Use the simulation panel on active operations menu to select a shop.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-150 dark:border-sky-900/30 rounded-xl">
                  <span className="text-[10px] font-mono text-sky-700 dark:text-sky-305 font-bold block uppercase mb-1">Testing Tip:</span>
                  <p className="text-xs text-slate-650 dark:text-zinc-400">
                    Use the <strong>Operations Panel</strong> shortcuts to tap any box and instantly lock its location into the record ledger.
                  </p>
                </div>
              </div>
            )}

            {scanStep === 'form' && scannedBox && (
              <form onSubmit={handleSaveCollection} className="space-y-6">
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/30 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-300 block font-mono">Tag Authentication Validated</span>
                    <p className="text-[11px] text-sky-800 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      Django DB ledger matched! Verified Box Node ID <strong>{scannedBox.id}</strong> connected with donor shop <strong>{scannedBox.donorName}</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-zinc-350">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">Target Box Registry ID</span>
                    <strong className="text-base font-mono font-bold text-slate-900 dark:text-white leading-loose">{scannedBox.id}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">Operational Status</span>
                    <span className="inline-block py-1 px-2.5 font-mono text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded mt-1 border border-sky-200/50">
                      {scannedBox.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono uppercase block">Donor Partner Shop Name</span>
                    <strong className="text-slate-850 dark:text-white font-black block text-sm mt-0.5">{scannedBox.donorName}</strong>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1 leading-normal">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {scannedBox.address}, {scannedBox.city}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300" htmlFor="colAmount">
                    Total Cash Yield Extracted ($) *
                  </label>
                  <input
                    id="colAmount"
                    type="number"
                    step="0.01"
                    required
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    placeholder="e.g. 150.00"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-455">Count physical bills thoroughly before entering values.</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300" htmlFor="colNotes">
                    Technical Field Audit Notes
                  </label>
                  <textarea
                    id="colNotes"
                    value={collectNotes}
                    onChange={(e) => setCollectNotes(e.target.value)}
                    placeholder="e.g. Key locks verified; locks sticky but functional, dust cleared, metal casing intact."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-805">
                  <button
                    type="button"
                    onClick={resetScanFlow}
                    className="flex-1 py-3 bg-[#F8FAFC] dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs"
                  >
                    Rescan Tag
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Verify & Save Records ledger
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* ----------------------------------------------------
            VIEW ISSUE: REPORT COMPLIANCE INCIDENTS
           ---------------------------------------------------- */}
        {activeView === 'issue' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-black p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md w-full">
            <form onSubmit={handleIssueSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="fBox">
                  Select Associated Donation Box *
                </label>
                <select
                  id="fBox"
                  required
                  value={issueBoxId}
                  onChange={(e) => setIssueBoxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 font-bold"
                >
                  <option value="">-- Select Damaged / Full Casing Node --</option>
                  {donationBoxes.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} - {b.donorName} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="fType">
                  Incident Casing Severity *
                </label>
                <select
                  id="fType"
                  required
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 font-bold"
                >
                  <option value="Damaged Box">Damaged Box Hangers / Acrylic chip</option>
                  <option value="Missing Box">Missing Box / Untraceable cross-streets</option>
                  <option value="Locked">Locked / Sticky Casing / Key slot failure</option>
                  <option value="Full Box">Full Casing Capacity (Urgent Collection)</option>
                  <option value="Relocation Required">Relocation Request from Shop Authority</option>
                  <option value="Other">Other Non-compliance incidents</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="fDesc">
                  Elaborate Casing Audit Incident Details *
                </label>
                <textarea
                  id="fDesc"
                  required
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Provide precise descriptions. e.g. Side clear frame lock contains stress cracks and requires acrylic adhesive repair immediately..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1">
                  Upload Snapshot Image Evidence
                </label>
                <div 
                  onClick={() => setPhotoUploaded(true)}
                  className={`border-2 border-dashed ${
                    photoUploaded 
                      ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-305 text-sky-800 dark:text-sky-400' 
                      : 'bg-[#F8FAFC] dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100/50 hover:border-sky-400 transition-all'
                  } rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center`}
                >
                  <Camera className={`w-8 h-8 ${photoUploaded ? 'text-sky-600' : 'text-slate-400'} mb-2`} />
                  {photoUploaded ? (
                    <div className="space-y-0.5">
                      <strong className="text-xs block font-bold text-slate-800 dark:text-white">Active_Damage_Audit_Evidence.jpg</strong>
                      <span className="text-[11px] text-sky-650">Simulated Upload Checked. Tap again to clear context.</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <strong className="text-xs text-slate-755 dark:text-zinc-300 block font-semibold">Take Mock Audit Snapshot</strong>
                      <span className="text-[11px] text-slate-400 block">Accepts secure JPG or PNG formats under 10MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-805">
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="flex-1 py-2.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 font-bold rounded-xl text-xs text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs text-center shadow-sm"
                >
                  Submit Incident Dispatch
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            VIEW DEMAND: PROPOSE NEW PLACEMENTS
           ---------------------------------------------------- */}
        {activeView === 'demand' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-black p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md w-full">
            <form onSubmit={handleDemandSubmit} className="space-y-5">
              <div className="bg-sky-50 dark:bg-sky-950/20 rounded-xl p-4 text-xs text-sky-950 dark:text-sky-300 flex items-start gap-3 border border-sky-150 dark:border-sky-900/30">
                <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Propose coordinates, commercial high-traffic stores, or shopping malls to EcoGrowth validators. Secure approved placements to earn bonus shift coefficients during collections.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dLocation">
                  Proposed Commercial Vendor / Shop Title *
                </label>
                <input
                  id="dLocation"
                  type="text"
                  required
                  value={demandLocation}
                  onChange={(e) => setDemandLocation(e.target.value)}
                  placeholder="e.g. Clifton Galleria Pharmacy Crossway"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-805 dark:text-white focus:outline-none focus:border-sky-550"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dCity">
                    Target Municipal Area / City *
                  </label>
                  <input
                    id="dCity"
                    type="text"
                    required
                    value={demandCity}
                    onChange={(e) => setDemandCity(e.target.value)}
                    placeholder="e.g. Karachi"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dTraffic">
                    Estimated Daily Foot Traffic
                  </label>
                  <select
                    id="dTraffic"
                    value={demandTraffic}
                    onChange={(e) => setDemandTraffic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-sky-500 font-bold"
                  >
                    <option value="Low (under 100/day)">Low (under 100 people/day)</option>
                    <option value="Moderate (100-500/day)">Moderate (100 to 500/day)</option>
                    <option value="High (500-1000/day)">High (500 to 1,000/day)</option>
                    <option value="Very High (1000+/day)">Very High (1,000+ people/day)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dAddress">
                  Specific Street / Floor Address *
                </label>
                <input
                  id="dAddress"
                  type="text"
                  required
                  value={demandAddress}
                  onChange={(e) => setDemandAddress(e.target.value)}
                  placeholder="e.g. Ground Floor, Sector C Crossway Street 8"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dContact">
                    Store Authority / Contact Person *
                  </label>
                  <input
                    id="dContact"
                    type="text"
                    required
                    value={demandContactPerson}
                    onChange={(e) => setDemandContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Tariq Siddiqui"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dPhone">
                    Store Authority Contact Number *
                  </label>
                  <input
                    id="dPhone"
                    type="text"
                    required
                    value={demandContactPhone}
                    onChange={(e) => setDemandContactPhone(e.target.value)}
                    placeholder="e.g. +92 (300) 555-1234"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 font-mono text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-zinc-300 mb-1" htmlFor="dNotes">
                  Collector Feasibility Evaluation Notes
                </label>
                <textarea
                  id="dNotes"
                  value={demandNotes}
                  onChange={(e) => setDemandNotes(e.target.value)}
                  placeholder="e.g. The manager explicitly agreed, offered to position the acrylic casing right on the main checkout counter side under security camera oversight..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-805">
                <button
                  type="button"
                  onClick={() => setActiveView('dashboard')}
                  className="flex-1 py-2.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 font-bold rounded-xl text-xs text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs text-center shadow-sm"
                >
                  Submit Placement Proposal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            VIEW EXPENSES: FILE FUEL/BICYCLE DAMAGE CLAIMS
           ---------------------------------------------------- */}
        {activeView === 'expense' && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            
            {/* Top alert info box */}
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 text-xs text-amber-955 dark:text-amber-400 flex items-start gap-3 border border-amber-200/50 dark:border-amber-900/30">
              <Receipt className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Field collectors can file fuel charges, bike punctures, or locker keys maintenance here. Upload detailed description notes. Admin auditors verify receipts during weekly shifts cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left hand column: Fast Add Form */}
              <div className="md:col-span-1 bg-white dark:bg-black p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start">
                <form onSubmit={handleSaveExpense} className="space-y-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-805 pb-3">
                    New expense file
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-705 dark:text-zinc-350" htmlFor="expCategory">
                      Invoice Category *
                    </label>
                    <select
                      id="expCategory"
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 font-bold"
                    >
                      <option value="Petrol">Petrol / Fuel Motor</option>
                      <option value="Bike Puncture">Bicycle / Motor Puncture</option>
                      <option value="Food">Collector Meals</option>
                      <option value="Hardware">Hardware Keys/Locker screws</option>
                      <option value="Other">Miscellaneous Fees</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-705 dark:text-zinc-350" htmlFor="expAmount">
                      Amount Spent ($) *
                    </label>
                    <input
                      id="expAmount"
                      type="number"
                      step="0.01"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="e.g. 24.50"
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-705 dark:text-zinc-350" htmlFor="expDesc">
                      Brief audit info note *
                    </label>
                    <input
                      id="expDesc"
                      type="text"
                      required
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="e.g. Puncture repair Clifton"
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    File Expense Casing
                  </button>
                </form>
              </div>

              {/* Right hand column: Expanded logs table ledger */}
              <div className="md:col-span-2 bg-white dark:bg-black p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-805 pb-3.5 mb-4">
                    My reimbursement invoices ledger
                  </h3>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {expenses
                      .filter((e) => e.collectorId === mockCollectorId)
                      .map((item) => (
                        <div key={item.id} className="p-3.5 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs hover:shadow-xs transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 dark:text-white font-extrabold">{item.category}</strong>
                              <span className={`text-[9px] font-extrabold uppercase py-0.5 px-2 rounded-full border ${
                                item.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-905 border-emerald-100 dark:border-emerald-900/30' :
                                item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium mt-0.5 leading-snug">{item.description}</span>
                            <span className="text-[9px] text-zinc-400 font-mono block mt-1">ID: {item.id} • Submitted on {item.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">${item.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}

                    {expenses.filter((e) => e.collectorId === mockCollectorId).length === 0 && (
                      <div className="text-center py-12 text-zinc-400 italic text-xs">
                        No field expense slips registered for COL-001.
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-6 py-2 border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-800 dark:text-zinc-300 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  Return to Control Room
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            VIEW HISTORY: CLEARED LOGS TABLE OVERVIEW
           ---------------------------------------------------- */}
        {activeView === 'history' && (
          <div className="bg-white dark:bg-black p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto w-full space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-805 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono">
                  Collection shift database
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">Browse physical cash boxes cleared during active rotations.</p>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 dark:bg-sky-950 p-1.5 px-3 rounded-lg border border-sky-100">
                Processed total: {myCollections.length} records
              </span>
            </div>

            {/* Search and Period filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Filter records list by box tag or vendor shop..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Day filter selection */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-slate-800 md:w-80 h-10 align-middle">
                {(['All', 'Today', 'Weekly', 'Monthly'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`py-1 text-[11px] font-extrabold rounded-lg transition text-center ${
                      historyFilter === filter
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-transparent dark:border-slate-800'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Core scroll history items list */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredHistory.map((rec) => (
                <div key={rec.id} className="p-4 bg-[#F8FAFC] dark:bg-zinc-950 border-b border-slate-100 dark:border-slate-805 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs hover:bg-[#F4F7FA] dark:hover:bg-sky-950/20 transition-all gap-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/55 flex items-center justify-center shrink-0 border border-sky-100/30">
                      <Coins className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-extrabold">{rec.donorName}</strong>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sky-850 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/50 px-1.5 py-0.25 rounded border border-sky-200/50 dark:border-sky-900/50 font-mono">Box {rec.boxId}</span>
                        <span>• Audited {rec.date}</span>
                        {rec.notes && <span className="text-slate-400 italic">({rec.notes})</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right self-end sm:self-center">
                    <span className="text-sm font-black text-sky-700 dark:text-sky-400 font-mono tracking-tight">${rec.amount.toFixed(2)}</span>
                    <span className="block text-[9px] text-zinc-400 font-mono uppercase mt-0.5">ID: {rec.id}</span>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && (
                <div className="text-center py-16 text-zinc-400 italic">
                  <History className="w-10 h-10 text-zinc-250 mx-auto mb-3" />
                  <span>No shift collection logs registered matching standard search filters.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            VIEW PROFILE: ACCESSIBILITY SPECS
           ---------------------------------------------------- */}
        {activeView === 'profile' && profileDetails && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-black p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full space-y-6">
            
            {/* Outer Stat Block */}
            <div className="p-6 bg-sky-950 text-sky-105 border border-sky-900 rounded-xl text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-850/30 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-800 font-sans text-white font-extrabold text-base mb-3 shadow">
                JS
              </div>
              <h3 className="text-lg font-black text-white">{profileDetails.name}</h3>
              <span className="text-[10px] font-mono font-bold bg-sky-900 text-sky-300 py-1 px-3 rounded-full border border-sky-800/40 uppercase tracking-widest mt-1.5">
                {profileDetails.id} • Field Auditor
              </span>

              <div className="grid grid-cols-2 gap-4 divide-x divide-sky-900 mt-6 border-t border-sky-900/40 pt-5 text-center w-full max-w-sm">
                <div>
                  <span className="text-[10px] text-sky-400 font-mono block uppercase">Total Yield extracted</span>
                  <strong className="text-lg font-black text-white font-mono mt-0.5 block">${totalMyCollectionsSum.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-sky-400 font-mono block uppercase">Assigned shop nodes</span>
                  <strong className="text-lg font-black text-white font-mono mt-0.5 block">2 Active locations</strong>
                </div>
              </div>
            </div>

            {/* Compliance specs rows */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-2 font-semibold">
                  <User className="w-4 h-4 text-slate-400 shrink-0" /> Field Agent Grade
                </span>
                <strong className="text-slate-800 dark:text-white font-bold">Licensed Compliance Officer</strong>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-2 font-semibold">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" /> Office Registry
                </span>
                <strong className="text-slate-800 dark:text-white font-bold">Karachi Central Dispatch Unit</strong>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-2 font-semibold">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" /> Device Contact
                </span>
                <strong className="text-slate-800 dark:text-white font-bold font-mono">{profileDetails.phone}</strong>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-2 font-semibold">
                  <FileCheck className="w-4 h-4 text-slate-400 shrink-0" /> Certification Authority
                </span>
                <span className="py-0.5 px-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold font-mono text-[10px] rounded-full">
                  PASSING LEVEL A+
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveView('dashboard')}
              className="w-full py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 transition font-bold rounded-xl text-xs text-center cursor-pointer"
            >
              Return to main Panel
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default CollectorView;
