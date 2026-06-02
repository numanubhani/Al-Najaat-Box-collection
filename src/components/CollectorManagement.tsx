/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { Collector, DonationBox, CollectionRecord } from '../types';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Power,
  PowerOff,
  Edit,
  BadgeAlert,
  X,
  CreditCard,
  Box,
  MapPin,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  KeyRound
} from 'lucide-react';

export const CollectorManagement: React.FC = () => {
  const { collectors, donationBoxes, collections, updateCollectorStatus, resetCollectorPassword, registrations, approveRegistration, rejectRegistration } = useNGOStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Disabled'>('All');
  
  // Pending approvals filtered list
  const pendingRequests = registrations ? registrations.filter(r => r.status === 'Pending') : [];
  
  // Dialog modal state
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form Fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const filteredCollectors = collectors.filter((col) => {
    const matchesSearch =
      col.name.toLowerCase().includes(search.toLowerCase()) ||
      col.email.toLowerCase().includes(search.toLowerCase()) ||
      col.phone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || col.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getCollectorBoxesCount = (collectorId: string) => {
    return donationBoxes.filter((b) => b.collectorId === collectorId).length;
  };

  const getCollectorTotalAmount = (collectorId: string) => {
    return collections
      .filter((c) => c.collectorId === collectorId)
      .reduce((acc, current) => acc + current.amount, 0);
  };

  // Handle trigger edit modal
  const handleOpenEdit = (col: Collector) => {
    setEditName(col.name);
    setEditPhone(col.phone);
    setEditEmail(col.email);
    setSelectedCollector(col);
    setIsEditOpen(true);
  };

  // Submit edits (stored locally)
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollector) return;

    // Mutate the state (simulated edit)
    selectedCollector.name = editName;
    selectedCollector.phone = editPhone;
    selectedCollector.email = editEmail;

    setIsEditOpen(false);
    setSelectedCollector(null);
  };

  // View collector stats & audit history detail modal
  const [viewingStaff, setViewingStaff] = useState<Collector | null>(null);

  const handleResetPassword = async (collector: Collector) => {
    const nextPassword = window.prompt(`Set a new password for ${collector.name} (minimum 6 characters):`);
    if (!nextPassword) return;
    if (nextPassword.trim().length < 6) {
      window.alert('Password must be at least 6 characters.');
      return;
    }
    try {
      await resetCollectorPassword(collector.id, nextPassword.trim());
      window.alert(`Password reset successfully for ${collector.name}.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to reset password.');
    }
  };

  const getStaffAssignedBoxes = (collectorId: string) => {
    return donationBoxes.filter((b) => b.collectorId === collectorId);
  };

  const getStaffCollections = (collectorId: string) => {
    return collections.filter((c) => c.collectorId === collectorId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Registration Requests Approvals Panel */}
      {pendingRequests.length > 0 && (
        <div className="bg-sky-50/50 border border-sky-150 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center justify-between pb-3.5 border-b border-sky-100">
            <div className="flex items-center gap-2.5">
              <span className="p-1 px-2 text-sky-800 bg-sky-100 font-mono text-[10px] font-black rounded-lg shrink-0">
                {pendingRequests.length} REQUESTS
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Staff Registration Approvals</h2>
                <p className="text-[10px] text-zinc-500 mt-0.5">Approve newly requested collector profiles to grant them sandbox scanning ledger access.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white border border-slate-200/80 p-4 rounded-xl flex flex-col justify-between shadow-3xs hover:shadow-2xs transition-shadow">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block font-extrabold text-slate-850 text-xs">{req.name}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">{req.email}</span>
                    </div>
                    <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-zinc-50 border border-zinc-150 rounded-full text-slate-500">
                      {req.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-slate-550 border-t border-dashed border-zinc-150 pt-2.5">
                    <div>
                      <span className="block text-zinc-400 font-mono font-bold uppercase text-[8px] tracking-wide mb-0.5">Contact Line:</span>
                      <span className="font-semibold text-slate-700">{req.phone}</span>
                    </div>
                    <div>
                      <span className="block text-zinc-400 font-mono font-bold uppercase text-[8px] tracking-wide mb-0.5">Registered:</span>
                      <span className="font-semibold text-slate-700">{req.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-50">
                  <button
                    onClick={() => rejectRegistration(req.id)}
                    className="flex-grow py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold cursor-pointer transition text-center"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveRegistration(req.id)}
                    className="flex-grow py-1.5 bg-sky-600 hover:bg-sky-700 border border-sky-600 text-white rounded-lg text-xs font-bold cursor-pointer transition text-center"
                  >
                    Approve Staff
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Active NGO Collectors</h1>
          <p className="text-sm text-zinc-500">Coordinate and audit field staff managing QR code scan logs and issue files.</p>
        </div>
      </div>

      {/* Filters and search box */}
      <div className="bg-white p-4 rounded-xl border border-zinc-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search collector names, emails or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto select-none">
          {['All', 'Active', 'Disabled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-55'
              }`}
            >
              {status} Staff
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Identity / Contact</th>
                <th className="py-3.5 px-6 text-center">Assigned Boxes</th>
                <th className="py-3.5 px-6 text-right">Lifetime Collections</th>
                <th className="py-3.5 px-6 text-center">Compliance Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredCollectors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No dispatchers found.</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Change filters to find other field collectors.</p>
                  </td>
                </tr>
              ) : (
                filteredCollectors.map((col) => {
                  const assignedCount = getCollectorBoxesCount(col.id);
                  const totalCollected = getCollectorTotalAmount(col.id);

                  return (
                    <tr key={col.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4.5 px-6 align-middle font-semibold text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs ${
                            col.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {col.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="block text-zinc-850">{col.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono tracking-wider">{col.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 align-middle">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{col.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-300" />
                          <span>{col.phone}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-center">
                        <span className="font-mono font-bold text-zinc-800 text-sm bg-zinc-50 py-1 px-2.5 rounded-md border border-zinc-200">
                          {assignedCount}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-right font-mono font-bold text-emerald-800">
                        ${totalCollected.toFixed(2)}
                      </td>
                      <td className="py-4.5 px-6 align-middle text-center">
                        <span
                          className={`inline-block py-1 px-2 rounded-full text-xs font-semibold ${
                            col.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : 'bg-rose-50 text-rose-800 border-rose-100'
                          }`}
                        >
                          {col.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingStaff(col)}
                            className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded text-xs border border-zinc-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleOpenEdit(col)}
                            className="p-1 bg-zinc-50 border border-zinc-150 rounded hover:border-blue-300 hover:bg-blue-100/10 text-blue-700 transition"
                            title="Edit Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(col)}
                            className="p-1 bg-zinc-50 border border-zinc-150 rounded hover:border-amber-300 hover:bg-amber-100/10 text-amber-700 transition"
                            title="Reset Collector Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const nextStatus = col.status === 'Active' ? 'Disabled' : 'Active';
                              if (confirm(`Change status of ${col.name} to ${nextStatus}?`)) {
                                updateCollectorStatus(col.id, nextStatus);
                              }
                            }}
                            className={`p-1 bg-zinc-50 border border-zinc-150 rounded transition ${
                              col.status === 'Active'
                                ? 'hover:border-rose-300 hover:bg-rose-100/10 text-rose-600'
                                : 'hover:border-emerald-300 hover:bg-emerald-100/10 text-emerald-600'
                            }`}
                            title={col.status === 'Active' ? 'Disable Collector' : 'Enable Collector'}
                          >
                            {col.status === 'Active' ? (
                              <Power className="w-3.5 h-3.5" />
                            ) : (
                              <PowerOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modification Modal */}
      {isEditOpen && selectedCollector && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4.5 border-b border-zinc-100">
              <h2 className="text-md font-bold text-zinc-900">
                Edit Staff Profile ({selectedCollector.id})
              </h2>
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCollector(null);
                }}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4.5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="colName">
                  Collector Full Name
                </label>
                <input
                  id="colName"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="colEmail">
                  Official Email Address
                </label>
                <input
                  id="colEmail"
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="colPhone">
                  Mobile Number
                </label>
                <input
                  id="colPhone"
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedCollector(null);
                  }}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs animate-pulse-once"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing details audit history drawer */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{viewingStaff.name}</h2>
                <span className="text-[10px] font-mono uppercase bg-zinc-100 py-0.5 px-2 rounded text-zinc-600 font-bold">
                  {viewingStaff.id} Compliance File
                </span>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto text-zinc-800">
              {/* Stats Block */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Life Yield</span>
                  <div className="text-xl font-extrabold text-emerald-950 font-sans mt-0.5">
                    ${getCollectorTotalAmount(viewingStaff.id).toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                  <span className="text-[10px] font-mono text-zinc-550 font-bold uppercase block">Managed Boxes</span>
                  <div className="text-xl font-extrabold text-zinc-900 font-sans mt-0.5">
                    {getCollectorBoxesCount(viewingStaff.id)} Boxes
                  </div>
                </div>
              </div>

              {/* Box Placments */}
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wide mb-2 flex items-center gap-1">
                  <Box className="w-3.5 h-3.5" /> Placements Managed
                </h3>
                {getStaffAssignedBoxes(viewingStaff.id).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No physical donation boxes assigned currently.</p>
                ) : (
                  <div className="space-y-2">
                    {getStaffAssignedBoxes(viewingStaff.id).map(b => (
                      <div key={b.id} className="p-2.5 bg-zinc-50/70 border border-zinc-100 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-zinc-800 font-mono">{b.id}</strong> — <span className="text-zinc-700 font-medium">{b.donorName}</span>
                          <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {b.address}, {b.city}
                          </p>
                        </div>
                        <span className={`py-0.5 px-2 rounded-full font-mono text-[9px] font-bold ${
                          b.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent loops */}
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wide mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Recent Field Scanning Records
                </h3>
                {getStaffCollections(viewingStaff.id).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No collections registered on-record.</p>
                ) : (
                  <div className="space-y-2">
                    {getStaffCollections(viewingStaff.id).map(rec => (
                      <div key={rec.id} className="p-2.5 border border-zinc-100 rounded-lg text-xs hover:bg-zinc-50 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-zinc-800">Box {rec.boxId}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">Date: {rec.date}</div>
                        </div>
                        <div className="text-right">
                          <strong className="text-emerald-700 font-mono">${rec.amount.toFixed(2)}</strong>
                          <div className="text-[9px] text-zinc-400 italic">ID: {rec.id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setViewingStaff(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
              >
                Close Compliance File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CollectorManagement;
