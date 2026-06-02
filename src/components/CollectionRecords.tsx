/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import {
  Calendar,
  Search,
  Filter,
  User,
  MapPin,
  DollarSign,
  AlertTriangle,
  History,
  TrendingUp,
  SlidersHorizontal,
  FolderSync
} from 'lucide-react';

export const CollectionRecords: React.FC = () => {
  const { collections, collectors, donationBoxes, sessionDate } = useNGOStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectorId, setSelectedCollectorId] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Last7Days' | 'Last30Days'>('All');

  // Get list of unique cities for location filtering
  const cities = Array.from(new Set(donationBoxes.map((b) => b.city)));

  // Filter logic
  const filteredCollections = collections.filter((item) => {
    // 1. Search Query
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch =
      item.donorName.toLowerCase().includes(searchLow) ||
      item.address.toLowerCase().includes(searchLow) ||
      item.boxId.toLowerCase().includes(searchLow) ||
      item.id.toLowerCase().includes(searchLow) ||
      item.collectorName.toLowerCase().includes(searchLow);

    // 2. Collector filter
    const matchesCollector =
      selectedCollectorId === 'All' || item.collectorId === selectedCollectorId;

    // 3. City/Location filter
    let matchesCity = true;
    if (selectedCity !== 'All') {
      const box = donationBoxes.find((b) => b.id === item.boxId);
      matchesCity = box ? box.city === selectedCity : false;
    }

    // 4. Date filter
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const itemDate = new Date(item.date);
      const today = new Date(sessionDate.iso);
      const diffTime = Math.abs(today.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'Today') {
        const yesterday = new Date(sessionDate.iso);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayIso = yesterday.toISOString().split('T')[0];
        matchesDate = item.date === sessionDate.iso || item.date === yesterdayIso;
      } else if (dateFilter === 'Last7Days') {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === 'Last30Days') {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesCollector && matchesCity && matchesDate;
  });

  const totalAmountFiltered = filteredCollections.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Audit Collection Ledger</h1>
          <p className="text-sm text-zinc-500">View and partition scanning ledger transactions submitted by field staff devices.</p>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white p-5 rounded-xl border border-zinc-150 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 text-zinc-900">
          <SlidersHorizontal className="w-4.5 h-4.5 text-emerald-600" />
          <span className="text-sm font-bold">Ledger Filtering Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Query Searches */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5" htmlFor="crSearch">
              Search Text Query
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="crSearch"
                type="text"
                placeholder="Id, shop, street, dispatcher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Collector dropdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5" htmlFor="crCollector">
              Field Collector
            </label>
            <select
              id="crCollector"
              value={selectedCollectorId}
              onChange={(e) => setSelectedCollectorId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none"
            >
              <option value="All">All Dispatchers</option>
              {collectors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cities dropdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5" htmlFor="crCity">
              Location City
            </label>
            <select
              id="crCity"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none"
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Special date buckets */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5" htmlFor="crRange">
              Reporting Cycle
            </label>
            <select
              id="crRange"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none"
            >
              <option value="All">Entire Ledger History</option>
              <option value="Today">Current Daily Cycle</option>
              <option value="Last7Days">Last 7 Days Yield</option>
              <option value="Last30Days">Last 30 Days Yield</option>
            </select>
          </div>
        </div>
      </div>

      {/* Yield Summary Alert */}
      <div className="bg-emerald-50 rounded-xl p-4.5 border border-emerald-150 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner">
            <DollarSign className="w-5 h-5 animate-bounce-once" />
          </div>
          <div>
            <span className="text-emerald-950 font-bold block text-sm">Filtered Yield Aggregates</span>
            <p className="text-xs text-emerald-800/80 leading-normal">
              Showing {filteredCollections.length} record entries mapping specified criteria logic.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block font-mono">Matched Total Sum</span>
          <span className="text-xl font-black font-sans text-emerald-950">${totalAmountFiltered.toFixed(2)}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-6">Trx ID</th>
                <th className="py-3.5 px-6">Collection Date</th>
                <th className="py-3.5 px-6">Box donor source</th>
                <th className="py-3.5 px-6">Location Target</th>
                <th className="py-3.5 px-6">Cleared By (Staff)</th>
                <th className="py-3.5 px-6 text-right">Amount Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <History className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No transaction records on record.</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Widen the filters above to access older audits.</p>
                  </td>
                </tr>
              ) : (
                filteredCollections.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-all">
                    <td className="py-4 px-6 align-middle font-mono text-zinc-500 font-semibold">
                      {item.id}
                    </td>
                    <td className="py-4 px-6 align-middle font-mono text-zinc-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div>
                        <span className="font-semibold text-zinc-800 block">{item.donorName}</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700">Box ID: {item.boxId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-zinc-650 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                        <span>{item.address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.collectorName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle text-right font-mono font-bold text-zinc-900">
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CollectionRecords;
