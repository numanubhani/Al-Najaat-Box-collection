/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import {
  Wallet,
  TrendingUp,
  Box,
  Percent,
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  Clock,
  PlusSquare,
  X,
  Check,
  UserCheck,
  Calendar,
  DollarSign,
  FolderSync
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    collections,
    donationBoxes,
    collectors,
    totalExpenses,
    commissionRate,
    theme,
    updateDonationBox,
    addNotification,
    sessionDate,
    showToast
  } = useNGOStore();
  const isDark = theme === 'dark';

  // Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<'assign' | 'reassign'>('assign');
  const [assignmentMonth, setAssignmentMonth] = useState<'current' | 'next'>('current');
  const [selectedCollectorId, setSelectedCollectorId] = useState(collectors[0]?.id || 'COL-001');
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [assignmentSuccessMessage, setAssignmentSuccessMessage] = useState('');
  const [scheduleVersion, setScheduleVersion] = useState(0);

  const SCHEDULE_STORAGE_KEY = 'ngo_assignment_schedule_v1';
  const nextMonthDate = new Date(`${sessionDate.iso}T00:00:00`);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const nextMonthLabel = nextMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const targetMonthKey = assignmentMonth === 'next' ? nextMonthKey : sessionDate.monthKey;
  const targetMonthLabel = assignmentMonth === 'next' ? nextMonthLabel : sessionDate.monthLabel;

  type AssignmentScheduleMap = Record<string, Record<string, string>>;
  const readScheduleMap = (): AssignmentScheduleMap => {
    try {
      const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as AssignmentScheduleMap;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };
  const writeScheduleMap = (next: AssignmentScheduleMap) => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(next));
    setScheduleVersion((v) => v + 1);
  };
  const scheduleMap = React.useMemo(readScheduleMap, [scheduleVersion]);
  const targetMonthSchedule = scheduleMap[targetMonthKey] || {};

  // Compute stats in real-time
  const totalCollections = collections.reduce((acc, current) => acc + (Number(current.amount) || 0), 0);
  const activeBoxesCount = donationBoxes.filter((b) => b.status === 'Active').length;
  const activeCollectorsCount = collectors.filter((c) => c.status === 'Active').length;
  
  const commission = totalCollections * commissionRate;
  const totalNetAmount = totalCollections - totalExpenses - commission;

  const lastMonthSum = collections
    .filter((c) => c.date.startsWith(sessionDate.previousMonthKey))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const thisMonthSum = collections
    .filter((c) => c.date.startsWith(sessionDate.monthKey))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const monthlyComparisonData = [
    {
      name: `Last Month (${sessionDate.previousMonthLabel})`,
      amount: lastMonthSum,
      label: `$${lastMonthSum.toFixed(2)}`
    },
    {
      name: `This Month (${sessionDate.monthLabel})`,
      amount: thisMonthSum,
      label: `$${thisMonthSum.toFixed(2)}`
    }
  ];

  const activeBoxes = donationBoxes.filter((b) => b.status === 'Active');
  const assignableBoxes =
    assignmentMode === 'assign'
      ? assignmentMonth === 'next'
        ? activeBoxes
        : activeBoxes.filter((b) => !b.collectorId)
      : activeBoxes.filter((b) => !!b.collectorId);

  const getCollectorName = (collectorId: string) =>
    collectors.find((c) => c.id === collectorId)?.name || collectorId;

  const handleBoxToggle = (boxId: string) => {
    setSelectedBoxIds((prev) =>
      prev.includes(boxId) ? prev.filter((id) => id !== boxId) : [...prev, boxId]
    );
  };

  const handleSelectAllBoxes = () => {
    if (selectedBoxIds.length === assignableBoxes.length) {
      setSelectedBoxIds([]);
    } else {
      setSelectedBoxIds(assignableBoxes.map((b) => b.id));
    }
  };

  const openAssignModal = (mode: 'assign' | 'reassign') => {
    setAssignmentMode(mode);
    setAssignmentMonth('current');
    setAssignmentSuccess(false);
    setSelectedBoxIds([]);
    setSelectedCollectorId(collectors.find((c) => c.status === 'Active')?.id || collectors[0]?.id || '');
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBoxIds.length === 0) {
      showToast('No boxes selected', 'Please select at least one donation box.', 'error');
      return;
    }

    const collector = collectors.find((c) => c.id === selectedCollectorId);
    if (!collector) return;

    const isReassign = assignmentMode === 'reassign';

    if (assignmentMode === 'assign' && assignmentMonth === 'next') {
      const existing = readScheduleMap();
      const monthSchedules = { ...(existing[targetMonthKey] || {}) };
      selectedBoxIds.forEach((boxId) => {
        monthSchedules[boxId] = selectedCollectorId;
      });
      writeScheduleMap({ ...existing, [targetMonthKey]: monthSchedules });

      addNotification(
        'demand',
        'Next Month Routes Scheduled',
        `Scheduled ${selectedBoxIds.length} box(es) for ${targetMonthLabel} to ${collector.name} (${collector.id}).`
      );
      setAssignmentSuccessMessage(
        `${selectedBoxIds.length} box(es) scheduled for ${targetMonthLabel} to ${collector.name}.`
      );
      setAssignmentSuccess(true);
      setTimeout(() => {
        setAssignmentSuccess(false);
        setIsAssignOpen(false);
        setSelectedBoxIds([]);
      }, 1500);
      return;
    }

    selectedBoxIds.forEach((boxId) => {
      const box = donationBoxes.find((b) => b.id === boxId);
      if (box) {
        const previousCollector = box.collectorId ? getCollectorName(box.collectorId) : 'Unassigned';
        const actionNote = isReassign
          ? `[Reassigned from ${previousCollector} to ${collector.name} on ${sessionDate.label} for ${targetMonthLabel}]`
          : `[Assigned to ${collector.name} on ${sessionDate.label} for ${targetMonthLabel}]`;
        updateDonationBox({
          ...box,
          collectorId: selectedCollectorId,
          notes: `${box.notes || ''} ${actionNote}`.trim()
        });
      }
    });

    addNotification(
      'demand',
      isReassign ? 'Boxes Reassigned' : 'Collection Task Assigned',
      `${isReassign ? 'Reassigned' : 'Assigned'} ${selectedBoxIds.length} box(es) to ${collector.name} (${collector.id}) for ${targetMonthLabel}.`
    );

    setAssignmentSuccessMessage(
      isReassign
        ? `${selectedBoxIds.length} box(es) reassigned to ${collector.name}.`
        : `${selectedBoxIds.length} box(es) assigned to ${collector.name}.`
    );
    setAssignmentSuccess(true);
    setTimeout(() => {
      setAssignmentSuccess(false);
      setIsAssignOpen(false);
      setSelectedBoxIds([]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-zinc-500">Real-time Al-Najaat funding collection and physical box asset analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-1.5 px-3 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{sessionDate.dayName}, {sessionDate.label}</span>
          </div>

          <button
            onClick={() => openAssignModal('assign')}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex"
          >
            <PlusSquare className="w-4.5 h-4.5 text-white" />
            Assign Box Collection
          </button>
          <button
            onClick={() => openAssignModal('reassign')}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex"
          >
            <FolderSync className="w-4.5 h-4.5 text-white" />
            Reassign Boxes
          </button>
        </div>
      </div>

      {/* KPI Value Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-teal-50/60 dark:from-emerald-950/35 dark:via-[#121826] dark:to-teal-950/25 p-5 rounded-xl border border-emerald-100/90 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3 text-emerald-700/80 dark:text-emerald-400/80">
            <span className="text-xs font-semibold uppercase tracking-wide">Total Collected</span>
            <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-emerald-950/60 text-emerald-600 shadow-sm flex items-center justify-center ring-1 ring-emerald-100 dark:ring-emerald-900/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-emerald-950 dark:text-emerald-300">${totalCollections.toFixed(2)}</h3>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-500/80 mt-1 flex items-center gap-0.5">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 font-bold" /> +14.2%
              </span>
              from last month
            </p>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-gradient-to-br from-rose-50 via-rose-50/30 to-orange-50/40 dark:from-rose-950/30 dark:via-[#121826] dark:to-orange-950/20 p-5 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-3 text-rose-700/80 dark:text-rose-400/80">
            <span className="text-xs font-semibold uppercase tracking-wide">Box Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-rose-950/50 text-rose-600 shadow-sm flex items-center justify-center ring-1 ring-rose-100 dark:ring-rose-900/50">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-rose-950 dark:text-rose-300">${totalExpenses.toFixed(2)}</h3>
            <p className="text-xs text-rose-800/65 dark:text-rose-500/75 mt-1">Hardware repairs & fuel claims</p>
          </div>
        </div>

        {/* Card 3: 15% Commission */}
        <div className="bg-gradient-to-br from-indigo-50 via-violet-50/50 to-sky-50/60 dark:from-indigo-950/30 dark:via-[#121826] dark:to-sky-950/25 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between mb-3 text-indigo-700/80 dark:text-indigo-400/80">
            <span className="text-xs font-semibold uppercase tracking-wide">15% Commission</span>
            <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-indigo-950/50 text-indigo-600 shadow-sm flex items-center justify-center ring-1 ring-indigo-100 dark:ring-indigo-900/50">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-indigo-950 dark:text-indigo-300">${commission.toFixed(2)}</h3>
            <p className="text-xs text-indigo-800/65 dark:text-indigo-500/75 mt-1">Field operations allocation</p>
          </div>
        </div>

        {/* Card 4: Net Amount */}
        <div className="bg-gradient-to-br from-emerald-100/90 via-teal-50 to-cyan-50/70 dark:from-emerald-900/40 dark:via-[#121826] dark:to-teal-950/30 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700/50 ring-1 ring-emerald-200/60 dark:ring-emerald-800/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 text-emerald-800 dark:text-emerald-300">
            <span className="text-xs font-bold uppercase tracking-wide">Net NGO Funding</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-emerald-950 dark:text-emerald-300">${totalNetAmount.toFixed(2)}</h3>
            <p className="text-xs text-emerald-900/75 dark:text-emerald-400/80 mt-1 font-medium">For direct social helper campaigns</p>
          </div>
        </div>

        {/* Card 5: Assets & Staff */}
        <div className="bg-gradient-to-br from-sky-50 via-slate-50/80 to-zinc-50 dark:from-sky-950/25 dark:via-[#121826] dark:to-slate-900/30 p-5 rounded-xl border border-sky-100 dark:border-sky-900/35 shadow-sm hover:shadow-md hover:border-sky-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-sky-800/80 dark:text-sky-400/80">
            <span className="text-xs font-semibold uppercase tracking-wide">Assets & Staff</span>
            <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 shadow-sm flex items-center justify-center ring-1 ring-sky-100 dark:ring-sky-900/50">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-sky-100/80 dark:divide-slate-800/80">
            <div>
              <h4 className="text-xl font-bold text-sky-950 dark:text-sky-200 font-sans">{donationBoxes.length}</h4>
              <p className="text-[10px] text-sky-800/70 dark:text-sky-500/80 font-mono">Boxes ({activeBoxesCount} Ok)</p>
            </div>
            <div className="pl-3">
              <h4 className="text-xl font-bold text-sky-950 dark:text-sky-200 font-sans">{collectors.length}</h4>
              <p className="text-[10px] text-sky-800/70 dark:text-sky-500/80 font-mono font-bold">Staff ({activeCollectorsCount} Act)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Monthly Comparison Graph Section - EXPLICITLY SIMPLIFIED */}
      <div className="bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/40 dark:from-sky-950/20 dark:via-[#121826] dark:to-indigo-950/15 p-5.5 rounded-2xl border border-sky-100/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-slate-850 mb-6 gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Monthly Comparison Graph
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Continuous gross yield tracking comparing last month vs current month collections.</p>
          </div>
          <div className="bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-sky-100 dark:border-slate-800 text-xs flex gap-6 text-slate-655 font-semibold shadow-xs">
            <div>
              <span className="text-zinc-400 block text-[9px] font-bold font-mono uppercase">{sessionDate.previousMonthLabel}</span>
              <strong className="text-slate-850 dark:text-white">${lastMonthSum.toFixed(2)}</strong>
            </div>
            <div className="border-r border-slate-200 dark:border-slate-800"></div>
            <div>
              <span className="text-sky-650 block text-[9px] font-bold font-mono uppercase">{sessionDate.monthLabel}</span>
              <strong className="text-sky-700 dark:text-sky-400">${thisMonthSum.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
            <BarChart data={monthlyComparisonData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} barSize={110}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} tickLine={false} />
              <YAxis stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#fff',
                  borderRadius: '12px',
                  border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                  color: isDark ? '#fff' : '#000',
                  fontSize: '12px',
                  fontWeight: 'bolder'
                }}
                formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Collections Gross']}
              />
              <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                <Cell fill="#64748b" /> {/* Gray color for Last Month */}
                <Cell fill="#0ea5e9" /> {/* vibrant Sky color for Current Month */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical System Alert */}
      <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 p-4.5 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-650 shrink-0 mt-0.5" />
        <div>
          <span className="text-sm font-bold text-amber-905 dark:text-amber-400 block leading-tight">Physical Asset Warning Alert:</span>
          <p className="text-xs text-amber-800/80 dark:text-amber-500/80 leading-relaxed max-w-5xl mt-0.5">
            Two donation box nodes are in offline status (BOX-0003 reported damaged near Sector G and BOX-0005 has been registered missing). 
            Auditors can leverage the "Complain and new box issue" tab to manage replacement or relocation dispatches.
          </p>
        </div>
      </div>

      {/* MODAL: ASSIGN COLLECTION TASKS */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-zinc-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4.5 bg-slate-50 dark:bg-slate-900/50 border-b border-zinc-150 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                {assignmentMode === 'reassign' ? (
                  <FolderSync className="w-5 h-5 text-amber-600" />
                ) : (
                  <PlusSquare className="w-5 h-5 text-sky-600" />
                )}
                {assignmentMode === 'reassign' ? 'Reassign Box Collection Task' : 'Assign Box Collection Task'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignmentSuccess ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-white block">
                  {assignmentMode === 'reassign' ? 'Boxes Reassigned!' : 'Collection Task Assigned!'}
                </span>
                <p className="text-xs text-zinc-400">{assignmentSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="p-5.5 space-y-4">
                <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-slate-900 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentMode('assign');
                      setSelectedBoxIds([]);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                      assignmentMode === 'assign'
                        ? 'bg-white dark:bg-slate-800 text-sky-700 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignmentMode('reassign');
                      setSelectedBoxIds([]);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                      assignmentMode === 'reassign'
                        ? 'bg-white dark:bg-slate-800 text-amber-700 shadow-xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Reassign
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {assignmentMode === 'reassign'
                    ? 'Select boxes already assigned to a collector and move them to another dispatcher.'
                    : assignmentMonth === 'next'
                      ? `Plan next month routing assignments (${targetMonthLabel}) without affecting this month.`
                      : 'Select unassigned active boxes and assign them to a collector.'}
                </p>

                {assignmentMode === 'assign' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 mb-1.5">
                      Assignment Month
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentMonth('current');
                          setSelectedBoxIds([]);
                        }}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          assignmentMonth === 'current'
                            ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50'
                            : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800 text-zinc-600'
                        }`}
                      >
                        Current ({sessionDate.monthLabel})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentMonth('next');
                          setSelectedBoxIds([]);
                        }}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          assignmentMonth === 'next'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50'
                            : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800 text-zinc-600'
                        }`}
                      >
                        Next ({nextMonthLabel})
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Collector dropdown */}
                <div>
                  <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-400 mb-1.5" htmlFor="acCollector">
                    Select Collector (Field Dispatcher)
                  </label>
                  <select
                    id="acCollector"
                    value={selectedCollectorId}
                    onChange={(e) => setSelectedCollectorId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-205 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white shadow-2xs"
                  >
                    {collectors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id}) — {c.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Box Select checkboxes */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">
                      {assignmentMode === 'reassign'
                        ? 'Select boxes to reassign'
                        : assignmentMonth === 'next'
                          ? `Select donation boxes to schedule for ${nextMonthLabel}`
                          : 'Select donation boxes to assign'} ({selectedBoxIds.length} checked)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllBoxes}
                      className="text-[10px] text-sky-655 font-bold hover:underline"
                    >
                      {selectedBoxIds.length === assignableBoxes.length && assignableBoxes.length > 0
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="border border-zinc-200 dark:border-slate-800 rounded-lg h-56 overflow-y-auto p-2 bg-zinc-50/50 dark:bg-slate-900/40 divide-y divide-zinc-150 dark:divide-slate-800/80">
                    {assignableBoxes.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-12 italic">
                        {assignmentMode === 'reassign'
                          ? 'No assigned boxes available to reassign.'
                          : assignmentMonth === 'next'
                            ? 'No active boxes available for next-month scheduling.'
                            : 'No unassigned active boxes. Use Reassign to move existing assignments.'}
                      </p>
                    ) : (
                      assignableBoxes.map((box) => {
                        const isChecked = selectedBoxIds.includes(box.id);
                        return (
                          <div
                            key={box.id}
                            onClick={() => handleBoxToggle(box.id)}
                            className="flex items-start gap-2.5 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-md transition cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-505 dark:focus:ring-sky-600 border-zinc-300 pointer-events-none mt-0.5"
                            />
                            <div className="text-xs leading-normal">
                              <span className="font-extrabold text-zinc-800 dark:text-white block leading-tight">
                                {box.donorName} ({box.id})
                              </span>
                              <span className="text-[10px] text-zinc-400 block font-light">
                                {box.address}, {box.city}
                              </span>
                              {assignmentMode === 'reassign' && box.collectorId ? (
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold mt-0.5">
                                  Current: {getCollectorName(box.collectorId)}
                                </span>
                              ) : null}
                              {assignmentMode === 'assign' && assignmentMonth === 'next' && targetMonthSchedule[box.id] ? (
                                <span className="text-[10px] text-sky-700 dark:text-sky-300 block font-semibold mt-0.5">
                                  Scheduled ({nextMonthLabel}): {getCollectorName(targetMonthSchedule[box.id])}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Submit actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-150 dark:border-slate-850 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAssignOpen(false)}
                    className="py-2 px-3.5 border border-zinc-200 dark:border-slate-750 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-slate-800 font-semibold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`py-2 px-4 text-white rounded-lg text-xs font-extrabold shadow-sm transition ${
                      assignmentMode === 'reassign'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-sky-600 hover:bg-sky-700'
                    }`}
                  >
                    {assignmentMode === 'reassign'
                      ? 'Confirm Reassign Routelist'
                      : assignmentMonth === 'next'
                        ? `Confirm & Schedule (${nextMonthLabel})`
                        : 'Confirm & Assign Box Routelist'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
