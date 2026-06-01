/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNGOStore } from '../store';
import {
  Wallet,
  TrendingUp,
  Box,
  Users,
  Percent,
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { collections, donationBoxes, collectors, totalExpenses, commissionRate, theme } = useNGOStore();
  const isDark = theme === 'dark';

  // Compute stats in real-time
  const totalCollections = collections.reduce((acc, current) => acc + current.amount, 0);
  const activeBoxesCount = donationBoxes.filter((b) => b.status === 'Active').length;
  const activeCollectorsCount = collectors.filter((c) => c.status === 'Active').length;
  
  const commission = totalCollections * commissionRate;
  const totalNetAmount = totalCollections - totalExpenses - commission;

  // Preparing charts data
  // 1. Daily Collection
  const dailyMap = collections.reduce((acc, curr) => {
    const d = curr.date;
    acc[d] = (acc[d] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const dailyChartData = Object.keys(dailyMap)
    .sort()
    .map((date) => ({
      name: date.substring(5), // Just MM-DD
      amount: dailyMap[date],
    }));

  // If daily is empty, put a placeholder standard
  if (dailyChartData.length === 0) {
    dailyChartData.push({ name: 'No data', amount: 0 });
  }

  // 2. Monthly Collection
  // Let's create a standard list representing several months
  const monthlyData = [
    { name: 'Jan', amount: 340 },
    { name: 'Feb', amount: 480 },
    { name: 'Mar', amount: 590 },
    { name: 'Apr', amount: 730 },
    { name: 'May', amount: collections.filter(c => c.date.startsWith('2026-05')).reduce((a, b) => a + b.amount, 0) },
    { name: 'Jun', amount: collections.filter(c => c.date.startsWith('2026-06')).reduce((a, b) => a + b.amount, 0) },
  ];

  // 3. Collector Performance
  const collectorMap = collections.reduce((acc, curr) => {
    const colName = curr.collectorName;
    acc[colName] = (acc[colName] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Include collectors who have no collections yet
  collectors.forEach(c => {
    if (!collectorMap[c.name]) {
      collectorMap[c.name] = 0;
    }
  });

  const collectorChartData = Object.keys(collectorMap).map((name) => ({
    name,
    collection: collectorMap[name],
  }));

  // 4. Location (Box) Performance
  const locationMap = collections.reduce((acc, curr) => {
    const bId = curr.boxId;
    const box = donationBoxes.find(b => b.id === bId);
    const label = box ? `${box.donorName} (${bId})` : bId;
    acc[label] = (acc[label] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Include boxes that have non collection
  donationBoxes.forEach(b => {
    const label = `${b.donorName} (${b.id})`;
    if (!locationMap[label]) {
      locationMap[label] = 0;
    }
  });

  const locationChartData = Object.keys(locationMap).map((label) => ({
    name: label.length > 20 ? label.substring(0, 18) + '...' : label,
    amount: locationMap[label],
  }));

  // Color constants
  const CHARTS_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-zinc-500">Real-time NGO funding collection and physical box asset analytics.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-50 border border-zinc-250 py-1.5 px-3 rounded-lg w-max shrink-0 self-start md:self-center">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>System Audited: June 1, 2026</span>
        </div>
      </div>

      {/* KPI Value Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-250/65 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-250 transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">${totalCollections.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
              </span>
              from last month
            </p>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-250/65 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-250 transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">Box Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">${totalExpenses.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-1">Maintenance hardware & costs</p>
          </div>
        </div>

        {/* Card 3: 15% Commision */}
        <div className="bg-white p-5 rounded-xl border border-slate-250/65 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-250 transition-all">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">15% Commission</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-slate-900">${commission.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 mt-1">Field operations allocation</p>
          </div>
        </div>

        {/* Card 4: Net Amount */}
        <div className="bg-white p-5 rounded-xl border border-emerald-500/30 ring-1 ring-emerald-500/15 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wide">Net NGO Funding</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-sans text-emerald-950">${totalNetAmount.toFixed(2)}</h3>
            <p className="text-xs text-emerald-800/80 mt-1">Available for direct campaign actions</p>
          </div>
        </div>

        {/* Card 5: Donation Boxes / Collectors */}
        <div className="bg-white p-5 rounded-xl border border-slate-250/65 shadow-sm hover:shadow-md hover:border-emerald-250 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wide">Assets & Staff</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-650 flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div>
              <h4 className="text-xl font-bold text-slate-800 font-sans">{donationBoxes.length}</h4>
              <p className="text-[10px] text-slate-500 font-mono">Boxes ({activeBoxesCount} Ok)</p>
            </div>
            <div className="pl-3">
              <h4 className="text-xl font-bold text-slate-800 font-sans">{collectors.length}</h4>
              <p className="text-[10px] text-slate-500 font-mono font-bold">Staff ({activeCollectorsCount} Act)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Collection */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-zinc-900">Daily collections cycle</h2>
            <p className="text-xs text-zinc-500">Breakdown of incoming donations recorded day-by-day.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                <XAxis dataKey="name" stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#000000' : '#fff', borderRadius: '8px', border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', color: isDark ? '#ffffff' : '#000000', fontSize: '12px' }} 
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Collected']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDaily)" />
                <Legend iconType="circle" fontSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Collection */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-zinc-900">Monthly cumulative collections</h2>
            <p className="text-xs text-zinc-500">Historical accumulation loop compared month-over-month.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                <XAxis dataKey="name" stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#000000' : '#fff', borderRadius: '8px', border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', color: isDark ? '#ffffff' : '#000000', fontSize: '12px' }}
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Accumulated']}
                />
                <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorMonthly)" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Collector Performance */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-zinc-900">Collector staff performance</h2>
            <p className="text-xs text-zinc-500">Comparison of total funds collected to date by specific staff members.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                <XAxis dataKey="name" stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} />
                <YAxis stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#000000' : '#fff', borderRadius: '8px', border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', color: isDark ? '#ffffff' : '#000000', fontSize: '12px' }}
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Total Collected']}
                />
                <Bar dataKey="collection" radius={[6, 6, 0, 0]} fill="#10b981">
                  {collectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHARTS_COLORS[index % CHARTS_COLORS.length]} />
                  ))}
                </Bar>
                <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Location Performance */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-zinc-900">Placement location ranking</h2>
            <p className="text-xs text-zinc-500">Evaluation of donation yields by retail/transit location boxes.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                <XAxis dataKey="name" stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={9} tickLine={false} interval={0} strokeWidth={1} />
                <YAxis stroke={isDark ? "#a1a1aa" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#000000' : '#fff', borderRadius: '8px', border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7', color: isDark ? '#ffffff' : '#000000', fontSize: '12px' }}
                  formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Yield']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#047857">
                  {locationChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHARTS_COLORS[(index + 2) % CHARTS_COLORS.length]} />
                  ))}
                </Bar>
                <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Alerts and Active Status Info */}
      <div className="bg-amber-50/55 border border-amber-200/50 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-sm font-bold text-amber-900 block">Critical Facility Reminders:</span>
          <p className="text-xs text-amber-800/80 leading-relaxed max-w-4xl mt-0.5">
            Two boxes require immediate attention (BOX-0003 is damaged, and BOX-0005 has been marked missing). 
            Review issue reports logged from the mobile interface to approve replacement dispatches or relocation.
          </p>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
