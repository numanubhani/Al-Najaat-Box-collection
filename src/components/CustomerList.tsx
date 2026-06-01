/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { DonationBox } from '../types';
import { QRCodeImg } from './QRCodeImg';
import {
  Users,
  Plus,
  Search,
  Building,
  QrCode,
  MapPin,
  Trash2,
  X,
  Phone,
  CheckCircle,
  FileText,
  AlertOctagon,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { donationBoxes, createDonationBox, updateDonationBox, deleteDonationBox, addNotification, collectors } = useNGOStore();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeQRSticker, setActiveQRSticker] = useState<DonationBox | null>(null);

  // Add Customer Form fields
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [assignedCollectorId, setAssignedCollectorId] = useState('COL-001');

  // Filter list
  const filteredCustomers = donationBoxes.filter((box) => {
    const matchesSearch =
      box.donorName.toLowerCase().includes(search.toLowerCase()) ||
      box.address.toLowerCase().includes(search.toLowerCase()) ||
      box.id.toLowerCase().includes(search.toLowerCase());
      
    const matchesCity = cityFilter === 'All' || box.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  // Extract unique cities for filtering
  const cities = ['All', ...Array.from(new Set(donationBoxes.map((b) => b.city)))];

  // Submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress || !newCity || !newPhone) {
      alert('Please fill out all fields first.');
      return;
    }

    const newBox = createDonationBox({
      donorName: newName,
      address: newAddress,
      city: newCity,
      contactNumber: newPhone,
      collectorId: assignedCollectorId,
      installationDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: newNotes || 'Retail host customer added.'
    });

    // Notify
    addNotification(
      'demand',
      'Host Customer Added',
      `${newName} has been registered. Cryptographic QR Sticker ${newBox.id} was auto-generated.`
    );

    // Reset fields
    setNewName('');
    setNewAddress('');
    setNewCity('');
    setNewPhone('');
    setNewNotes('');
    setIsAddOpen(false);
  };

  // Remove QR Sticker Action handler
  const handleRemoveSticker = (box: DonationBox) => {
    if (
      confirm(
        `Are you sure you want to remove the QR Code Sticker for ${box.donorName} (${box.id})?\nThis invalidates scanning and sets the box assignment to Inactive.`
      )
    ) {
      // Set status to Inactive or delete QR association
      updateDonationBox({
        ...box,
        status: 'Inactive',
        notes: `${box.notes || ''} [QR STICKER DECOMMISSIONED/REMOVED ON JUNE 1, 2026]`
      });

      addNotification(
        'issue',
        'Sticker Decommissioned',
        `QR Security Sticker has been removed from Host: ${box.donorName} (${box.id}).`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Outlets & Host Customers List</h1>
          <p className="text-sm text-zinc-500">
            Audit store partners hosting physical assets. Adding a customer automatically spawns their unique secure QR Code sticker labels.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex"
        >
          <Plus className="w-4 h-4" />
          Add Outlet Customer
        </button>
      </div>

      {/* Inputs controls and filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search customer names, branch locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm placeholder-zinc-405 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-medium text-slate-800"
          />
        </div>

        <div className="flex gap-2 shrink-0 select-none overflow-x-auto w-full sm:w-auto">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition whitespace-nowrap cursor-pointer ${
                cityFilter === city
                  ? 'bg-sky-50 border-sky-300 text-sky-850'
                  : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table / Grid view */}
      <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-6">Hosting Partner / Customer</th>
                <th className="py-3.5 px-6">Active Contacts</th>
                <th className="py-3.5 px-6">Assigned Dispatcher</th>
                <th className="py-3.5 px-6 text-center">QR Sticker Sticker Status</th>
                <th className="py-3.5 px-6 text-right">Telemetry Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <Building className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No partner outlets located.</p>
                    <p className="text-xs text-zinc-400">Search again or register a brand-new customer outlet.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((box) => {
                  const dispatcher = collectors.find((c) => c.id === box.collectorId);
                  const dataPayloadString = JSON.stringify({ box_id: box.id });
                  const isStickerRemoved = box.status === 'Inactive';

                  return (
                    <tr key={box.id} className="hover:bg-zinc-50/40 transition-colors">
                      <td className="py-4.5 px-6 align-middle font-semibold text-zinc-900">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-600 mt-0.5">
                            <Building className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <span className="block text-slate-800 font-bold leading-none">{box.donorName}</span>
                            <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 font-medium font-mono">
                              <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                              {box.address}, {box.city}
                            </div>
                            {box.notes && (
                              <p className="text-[10px] text-zinc-500 font-normal mt-0.5 max-w-sm italic">
                                Notes: {box.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-zinc-650 font-medium">
                        <div className="flex items-center gap-1 text-slate-600 text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-405 shrink-0" />
                          <span>{box.contactNumber}</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">EST. INSTALL: {box.installationDate}</span>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-zinc-550">
                        <span className="font-semibold text-xs text-slate-705 block">
                          {dispatcher ? dispatcher.name : 'Unassigned'}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono tracking-wider">
                          {box.collectorId} File
                        </span>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-center">
                        {isStickerRemoved ? (
                          <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-black uppercase rounded-full">
                            Sticker Removed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveQRSticker(box)}
                            className="inline-flex items-center gap-1.5 py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition text-[10px] font-mono font-black uppercase rounded-full cursor-pointer shadow-2xs"
                            title="Click to Open Secure Holographic QR Sticker Sticker Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active: {box.id}</span>
                          </button>
                        )}
                      </td>
                      <td className="py-4.5 px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open QR action */}
                          {!isStickerRemoved && (
                            <button
                              onClick={() => setActiveQRSticker(box)}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-150 text-sky-700 rounded text-xs transition font-semibold"
                            >
                              Open sticker
                            </button>
                          )}
                          
                          {/* Remove QR sticker button */}
                          {!isStickerRemoved ? (
                            <button
                              onClick={() => handleRemoveSticker(box)}
                              className="p-1 px-2 border border-rose-200 hover:bg-rose-100/10 text-rose-600 rounded transition font-medium text-xs flex items-center gap-1"
                              title="Decommission hologram tag values"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove QR Sticker
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateDonationBox({ ...box, status: 'Active' });
                                addNotification('collection', 'QR Restored', `Sticker association restored for ${box.donorName}.`);
                              }}
                              className="px-3 py-1 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-slate-650 rounded text-xs font-semibold"
                            >
                              Restore sticker
                            </button>
                          )}
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

      {/* Modal View: Add Customer */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4.5 border-b border-zinc-150 bg-slate-50/50">
              <h2 className="text-md font-extrabold text-zinc-900 flex items-center gap-1.5">
                <Building className="w-5 h-5 text-sky-600" />
                Register New Host Partner Customer
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1" htmlFor="cName">
                  Outlet Customer Name
                </label>
                <input
                  id="cName"
                  type="text"
                  required
                  placeholder="e.g. Walmart Substation or Cafe Delight"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1" htmlFor="cCity">
                    City Location
                  </label>
                  <input
                    id="cCity"
                    type="text"
                    required
                    placeholder="e.g. Houston"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1" htmlFor="cPhone">
                    Contact Phone Number
                  </label>
                  <input
                    id="cPhone"
                    type="text"
                    required
                    placeholder="+92 (300) 123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1" htmlFor="cAddr">
                  Complete Outlets Branch Address
                </label>
                <input
                  id="cAddr"
                  type="text"
                  required
                  placeholder="Suite 14B, Commercial Sector Lane"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1" htmlFor="cCollector">
                  Assign Field Dispatcher
                </label>
                <select
                  id="cCollector"
                  value={assignedCollectorId}
                  onChange={(e) => setAssignedCollectorId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                >
                  {collectors.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1" htmlFor="cNotes">
                  Initial Administrative Notes
                </label>
                <textarea
                  id="cNotes"
                  rows={2}
                  placeholder="e.g. Aligned placement inside main entry corridor under security cams."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                />
              </div>

              {/* Notification note */}
              <div className="bg-sky-50 border border-sky-200/50 p-3 rounded-lg text-xs text-sky-850 flex gap-2">
                <CheckCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  Adding this host registers a <strong>Donation Box</strong> profile. The cryptographic QR label token is synthesized immediately.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Register partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View: Click to Open Secure Holographic QR Sticker Sticker Code */}
      {activeQRSticker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h2 className="text-sm font-black text-zinc-950 flex items-center gap-1.5 uppercase font-mono">
                <QrCode className="w-5 h-5 text-emerald-600 animate-pulse" />
                QR Sticker Hologram
              </h2>
              <button
                onClick={() => setActiveQRSticker(null)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="p-5 border-2 border-dashed border-emerald-600 rounded-2xl bg-white w-full max-w-xs text-center text-zinc-950 shadow-md">
                <span className="bg-slate-900 text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  EcoGrowth secure hologram
                </span>
                
                <div className="my-4 flex items-center justify-center">
                  <QRCodeImg value={JSON.stringify({ box_id: activeQRSticker.id })} size={160} />
                </div>

                <div className="font-mono font-black text-xl tracking-tight text-slate-900 leading-none">{activeQRSticker.id}</div>
                <div className="font-bold text-xs text-slate-800 mt-1 max-w-xs">{activeQRSticker.donorName}</div>
                <div className="text-[10px] text-zinc-450 mt-1 font-semibold leading-tight">
                  STATION: {activeQRSticker.address}, {activeQRSticker.city}
                </div>
              </div>

              {/* print layout tip details */}
              <div className="mt-4 bg-slate-50 border border-slate-200 p-2.5 rounded-xl w-full text-[11px] text-slate-500 font-medium">
                <strong className="text-slate-850">Telemetry Link:</strong>
                <code className="text-[10px] bg-slate-100 font-mono block mt-1 p-1 text-emerald-700 border rounded">
                  {JSON.stringify({ box_id: activeQRSticker.id })}
                </code>
              </div>

              {/* action trigger buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setActiveQRSticker(null);
                    alert('Label Sticker template dispatch issued!');
                  }}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print sticker
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSticker(activeQRSticker)}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove QR Sticker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
