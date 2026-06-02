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
  DollarSign
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
    addNotification
  } = useNGOStore();
  const isDark = theme === 'dark';

  // Modal State
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState(collectors[0]?.id || 'COL-001');
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>([]);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Compute stats in real-time
  const totalCollections = collections.reduce((acc, current) => acc + current.amount, 0);
  const activeBoxesCount = donationBoxes.filter((b) => b.status === 'Active').length;
  const activeCollectorsCount = collectors.filter((c) => c.status === 'Active').length;
  
  const commission = totalCollections * commissionRate;
  const totalNetAmount = totalCollections - totalExpenses - commission;

  // Calculate Last Month (May 2026) vs This Month (June 2026) collection amount
  const lastMonthSum = collections
    .filter((c) => c.date.startsWith('2026-05'))
    .reduce((sum, item) => sum + item.amount, 0);

  const thisMonthSum = collections
    .filter((c) => c.date.startsWith('2026-06'))
    .reduce((sum, item) => sum + item.amount, 0);

  // Compare Last Month vs This Month comparison chart data
  const monthlyComparisonData = [
    {
      name: 'Last Month (May)',
      amount: lastMonthSum,
      label: `$${lastMonthSum.toFixed(2)}`
    },
    {
      name: 'This Month (June)',
      amount: thisMonthSum,
      label: `$${thisMonthSum.toFixed(2)}`
    }
  ];

  // Map box choices that are active or require collection
  const assignableBoxes = donationBoxes.filter((b) => b.status === 'Active');

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

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBoxIds.length === 0) {
      alert('Please select at least one donation box to assign.');
      return;
    }

    const collector = collectors.find((c) => c.id === selectedCollectorId);
    if (!collector) return;

    // Mutate state in real-time by assigning collectorId
    selectedBoxIds.forEach((boxId) => {
      const box = donationBoxes.find((b) => b.id === boxId);
      if (box) {
        updateDonationBox({
          ...box,
          collectorId: selectedCollectorId,
          notes: `${box.notes || ''} [Re-assigned to dispatcher ${collector.name} on June 1, 2026]`
        });
      }
    });

    // Fire real notification
    addNotification(
      'demand',
      'Collection Task Assigned',
      `Assigned ${selectedBoxIds.length} location boxes to Collector: ${collector.name} (${collector.id}).`
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
            <span>Last Audited: June 1, 2026</span>
          </div>

          <button
            onClick={() => {
              setIsAssignOpen(true);
              setAssignmentSuccess(false);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex"
          >
            <PlusSquare className="w-4.5 h-4.5 text-white" />
            Assign Box Collection
          </button>
        </div>
      </div>

      {/* KPI Value Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-slate-205 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-250 transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#1b2a24] text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">${totalCollections.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-0.5">
              <span className="text-emerald-600 font-semibold inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 font-bold" /> +14.2%
              </span>
              from last month
            </p>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-slate-205 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-250 transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">Box Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-[#2c1d22] text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">${totalExpenses.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-1">Hardware repairs & fuel claims</p>
          </div>
        </div>

        {/* Card 3: 15% Commission */}
        <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-slate-205 dark:border-slate-800/80 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-250 transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">15% Commission</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] dark:bg-[#1e293b] text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">${commission.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-1">Field operations allocation</p>
          </div>
        </div>

        {/* Card 4: Net Amount */}
        <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-emerald-500/30 ring-1 ring-emerald-550/15 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-650">Net NGO Funding</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-emerald-950 dark:text-emerald-400">${totalNetAmount.toFixed(2)}</h3>
            <p className="text-xs text-emerald-800/80 mt-1 font-medium">For direct social helper campaigns</p>
          </div>
        </div>

        {/* Card 5: Assets & Staff */}
        <div className="bg-white dark:bg-[#121826] p-5 rounded-xl border border-slate-205 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">Assets & Staff</span>
            <div className="w-8 h-8 rounded-lg bg-slate-55 dark:bg-slate-800/80 text-slate-600 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800/80">
            <div>
              <h4 className="text-xl font-bold text-slate-800 dark:text-white font-sans">{donationBoxes.length}</h4>
              <p className="text-[10px] text-slate-500 font-mono">Boxes ({activeBoxesCount} Ok)</p>
            </div>
            <div className="pl-3">
              <h4 className="text-xl font-bold text-slate-800 dark:text-white font-sans">{collectors.length}</h4>
              <p className="text-[10px] text-slate-500 font-mono font-bold">Staff ({activeCollectorsCount} Act)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Target Monthly Comparison Graph Section - EXPLICITLY SIMPLIFIED */}
      <div className="bg-white dark:bg-[#121826] p-5.5 rounded-2xl border border-zinc-150 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-slate-850 mb-6 gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Monthly Comparison Graph
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Continuous gross yield tracking comparing last month vs current month collections.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs flex gap-6 text-slate-655 font-semibold">
            <div>
              <span className="text-zinc-400 block text-[9px] font-bold font-mono">MAY COLLECTION</span>
              <strong className="text-slate-850 dark:text-white">${lastMonthSum.toFixed(2)}</strong>
            </div>
            <div className="border-r border-slate-200 dark:border-slate-800"></div>
            <div>
              <span className="text-sky-650 block text-[9px] font-bold font-mono">JUNE COLLECTION</span>
              <strong className="text-sky-700 dark:text-sky-400">${thisMonthSum.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
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
                <PlusSquare className="w-5 h-5 text-sky-600" />
                Assign Box Collection Task
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
                <span className="text-sm font-extrabold text-zinc-800 dark:text-white block">Collection Task Assigned!</span>
                <p className="text-xs text-zinc-400">Assigned boxes have been pushed to the field collector's route queue successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="p-5.5 space-y-4">
                
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
                      Select Donation Boxes to Collect ({selectedBoxIds.length} checked)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllBoxes}
                      className="text-[10px] text-sky-655 font-bold hover:underline"
                    >
                      {selectedBoxIds.length === assignableBoxes.length ? 'Deselect All' : 'Select All Active'}
                    </button>
                  </div>

                  <div className="border border-zinc-200 dark:border-slate-800 rounded-lg h-56 overflow-y-auto p-2 bg-zinc-50/50 dark:bg-slate-900/40 divide-y divide-zinc-150 dark:divide-slate-800/80">
                    {assignableBoxes.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-12 italic">No active donation boxes found.</p>
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
                              onChange={() => {}} // toggled via parent div click
                              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-505 dark:focus:ring-sky-600 border-zinc-300 pointer-events-none mt-0.5"
                            />
                            <div className="text-xs leading-normal">
                              <span className="font-extrabold text-zinc-800 dark:text-white block leading-tight">
                                {box.donorName} ({box.id})
                              </span>
                              <span className="text-[10px] text-zinc-400 block font-light">
                                {box.address}, {box.city}
                              </span>
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
                    className="py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-extrabold shadow-sm transition"
                  >
                    Confirm & Assign Box Routelist
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
