/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { DonationBox } from '../types';
import { QRCodeImg } from './QRCodeImg';
import {
  Plus,
  Search,
  Filter,
  QrCode,
  Edit,
  Trash2,
  X,
  MapPin,
  Calendar,
  Phone,
  Check,
  Printer,
  Download,
  AlertTriangle,
  Building,
  Users,
  ShieldAlert,
  Box
} from 'lucide-react';
import jsPDF from 'jspdf';

export const BoxManagement: React.FC = () => {
  const {
    donationBoxes,
    collectors,
    createDonationBox,
    updateDonationBox,
    deleteDonationBox,
    addNotification,
    theme
  } = useNGOStore();

  const isDark = theme === 'dark';

  // Local View Sub-Tabs: Unifying CustomerList and BoxManagement
  const [activeSubTab, setActiveSubTab] = useState<'boxes' | 'host_partners'>('boxes');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  
  // Create / Edit states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<DonationBox | null>(null);

  // Form Fields
  const [donorName, setDonorName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [collectorId, setCollectorId] = useState('');
  const [notes, setNotes] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [status, setStatus] = useState<DonationBox['status']>('Active');
  const [mapLink, setMapLink] = useState(''); // Request Map Link locator field

  // QR Modal States
  const [selectedBox, setSelectedBox] = useState<DonationBox | null>(null);
  const [qrPayload, setQrPayload] = useState('');

  // Handle open creation form
  const handleOpenCreateForm = () => {
    setEditingBox(null);
    setDonorName('');
    setAddress('');
    setCity('');
    setContactNumber('');
    setNotes('');
    setMapLink('');
    setInstallationDate(new Date().toISOString().split('T')[0]);
    
    // Choose first collector as default
    if (collectors.length > 0) {
      setCollectorId(collectors[0].id);
    } else {
      setCollectorId('');
    }
    
    setStatus('Active');
    setIsFormOpen(true);
  };

  // Handle open edit form
  const handleOpenEditForm = (box: DonationBox) => {
    setEditingBox(box);
    setDonorName(box.donorName);
    setAddress(box.address);
    setCity(box.city);
    setContactNumber(box.contactNumber);
    setCollectorId(box.collectorId);
    setInstallationDate(box.installationDate);
    setNotes(box.notes || '');
    setStatus(box.status);
    setMapLink(box.mapLink || '');
    setIsFormOpen(true);
  };

  // Handle submit form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !address || !city || !contactNumber || !collectorId) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingBox) {
      // Update
      const updated: DonationBox = {
        ...editingBox,
        donorName,
        address,
        city,
        contactNumber,
        collectorId,
        installationDate,
        notes,
        status,
        mapLink: mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donorName + ' ' + address + ' ' + city)}`
      };
      updateDonationBox(updated);
      addNotification(
        'collection',
        'Donor Box Configured',
        `${donorName} location and parameters updated.`
      );
    } else {
      // Create
      const newBox = createDonationBox({
        donorName,
        address,
        city,
        contactNumber,
        collectorId,
        installationDate,
        notes,
        status: 'Active',
        mapLink: mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(donorName + ' ' + address + ' ' + city)}`
      });
      // Show created box's QR immediately
      handleShowQR(newBox);
    }

    setIsFormOpen(false);
  };

  // Open QR display
  const handleShowQR = (box: DonationBox) => {
    setSelectedBox(box);
    // Secure payload: stores only box_id
    const payload = JSON.stringify({ box_id: box.id });
    setQrPayload(payload);
  };

  // Remove QR code sticker action (sets box to Inactive & logs decommission notes)
  const handleRemoveSticker = (box: DonationBox) => {
    if (
      confirm(
        `Are you sure you want to remove the QR Code Sticker for ${box.donorName} (${box.id})?\nThis invalidates scanning and sets the box assignment status to Inactive.`
      )
    ) {
      updateDonationBox({
        ...box,
        status: 'Inactive',
        notes: `${box.notes || ''} [QR SECURE STICKER REMOVED / DECOMMISSIONED BY ADMIN ON JUNE 1, 2026]`
      });

      addNotification(
        'issue',
        'Sticker Decommissioned',
        `QR Security Sticker has been removed from Host: ${box.donorName} (${box.id}).`
      );
    }
  };

  // Restore/Register QR code sticker
  const handleRestoreSticker = (box: DonationBox) => {
    updateDonationBox({
      ...box,
      status: 'Active',
      notes: `${box.notes || ''} [QR SECUR STICKER RESTORED BY ADMIN]`
    });

    addNotification(
      'collection',
      'QR Tag Sticker Restored',
      `Crypto scanner correlation restored for ${box.donorName} (${box.id}).`
    );
  };

  // Print individual label Simulator
  const handlePrintLabelPrinters = (box: DonationBox) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const payload = JSON.stringify({ box_id: box.id });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label - ${box.id}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              padding: 24px;
              color: #1f2937;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f3f4f6;
            }
            .label-card {
              background: #fff;
              border: 3px dashed #0284c7;
              border-radius: 16px;
              padding: 32px;
              width: 320px;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              position: relative;
            }
            .badge {
              background-color: #0284c7;
              color: #fff;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              padding: 4px 12px;
              border-radius: 9999px;
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
            }
            .org {
              font-size: 13px;
              color: #0369a1;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 2px;
            }
            .sub {
              font-size: 10px;
              color: #6b7280;
              margin-bottom: 12px;
            }
            .box-id {
              font-family: monospace;
              font-weight: bold;
              font-size: 20px;
              letter-spacing: 0.1em;
              margin: 12px 0 2px 0;
            }
            .donor {
              font-weight: bold;
              font-size: 15px;
              color: #111827;
            }
            .loc {
              font-size: 11px;
              color: #4b5563;
              margin-top: 4px;
            }
            .footer-note {
              font-size: 9px;
              color: #9ca3af;
              margin-top: 18px;
              line-height: 1.4;
            }
            .qr-placeholder {
              width: 170px;
              height: 170px;
              margin: 16px auto;
              background: #fafafa;
              border: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              color: #9cb2c0;
            }
            @media print {
              body { background: #fff; padding: 0; }
              .label-card { box-shadow: none; border: 3px dashed #000; }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="label-card">
            <div class="badge">NGO Asset Container</div>
            <div class="org">Al-Najaat Social Care</div>
            <div class="sub">Official Registered Charity Donation Box</div>
            
            <!-- Real QR Code Image using canvas generator representation -->
            <div class="qr-placeholder">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(payload)}" alt="QR Label ${box.id}" />
            </div>

            <div class="box-id">${box.id}</div>
            <div class="donor">${box.donorName}</div>
            <div class="loc">${box.address}, ${box.city}</div>
            <div class="footer-note font-sans">
              Warning: Cryptographic Anti-Tamper Security Label.<br/>
              Scan code to audit authentic field yields and ledger logs.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadLabelPDF = (box: DonationBox) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [80, 80] // Label dimension matching 80mm roll printer
    });

    const payload = JSON.stringify({ box_id: box.id });

    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.6);
    doc.rect(2, 2, 76, 76);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(3, 105, 161);
    doc.text('AL-NAJAAT SOCIAL CARE', 40, 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text('Official Box Donation Secure Label', 40, 10, { align: 'center' });

    // Insert QR endpoint API
    doc.addImage(
      `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(payload)}`,
      'JPEG',
      20, 13, 40, 40
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(box.id, 40, 58, { align: 'center' });

    doc.setFontSize(7.5);
    doc.text(box.donorName.length > 25 ? box.donorName.substring(0, 23) + '...' : box.donorName, 40, 63, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(75, 85, 99);
    doc.text(`${box.address}, ${box.city}`, 40, 67, { align: 'center' });

    doc.setFontSize(4.5);
    doc.setTextColor(150, 150, 150);
    doc.text('Cryptographic Scanner Label. Do not detach.', 40, 74, { align: 'center' });

    doc.save(`AlNajaat_QRLabel_${box.id}.pdf`);
  };

  // Filter listings
  const filteredBoxes = donationBoxes.filter((box) => {
    const matchesSearch =
      box.donorName.toLowerCase().includes(search.toLowerCase()) ||
      box.address.toLowerCase().includes(search.toLowerCase()) ||
      box.id.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || box.status === statusFilter;
    const matchesCity = cityFilter === 'All' || box.city === cityFilter;

    return matchesSearch && matchesStatus && matchesCity;
  });

  // Unique cities list
  const cities = ['All', ...Array.from(new Set(donationBoxes.map((b) => b.city)))];

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Add Donors & Devices</h1>
          <p className="text-sm text-zinc-500">
            Configure partner store hosts, deploy secure donation boxes, and audit tamper-proof holographic QR stickers.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreateForm}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Donor & Install Box
        </button>
      </div>

      {/* Sub-Tab Selector to swap between Active Boxes and Host Customers (unified list) */}
      <div className="flex bg-slate-100 dark:bg-slate-905 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-1 w-full max-w-sm select-none">
        <button
          onClick={() => {
            setActiveSubTab('boxes');
            setSearch('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'boxes'
              ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Box className="w-3.5 h-3.5 inline mr-1.5" />
          Active Donation Boxes
        </button>
        <button
          onClick={() => {
            setActiveSubTab('host_partners');
            setSearch('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'host_partners'
              ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Building className="w-3.5 h-3.5 inline mr-1.5" />
          Host Partners & Stickers
        </button>
      </div>

      {/* Inputs controls and filters */}
      <div className="bg-white dark:bg-[#121826] p-4 rounded-xl border border-zinc-150 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={
              activeSubTab === 'boxes'
                ? "Search Box ID, store name, or address..."
                : "Search hosting organization, contact person..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs placeholder-zinc-405 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold text-slate-800 dark:text-white"
          />
        </div>

        {activeSubTab === 'boxes' ? (
          /* Boxes filter tag buttons */
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 select-none">
            {['All', 'Active', 'Inactive', 'Damaged', 'Missing'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-50 dark:bg-[#1b2a24] border-emerald-300 dark:border-emerald-800 text-emerald-850 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        ) : (
          /* Host Partner filter city tag buttons */
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 select-none">
            {cities.map((city) => (
              <button
                key={city || 'Unspecified'}
                onClick={() => setCityFilter(city)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition whitespace-nowrap cursor-pointer ${
                  cityFilter === city
                    ? 'bg-emerald-50 dark:bg-[#1b2a24] border-emerald-300 dark:border-emerald-800 text-emerald-850 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-900 border-zinc-200 dark:border-slate-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeSubTab === 'boxes' ? (
        /* RENDER SUB-VIEW 1: ACTIVE DONATION BOX DEVICES List */
        <div className="bg-white dark:bg-[#121826] rounded-xl border border-zinc-150 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-150">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-slate-900/50 border-b border-zinc-100 dark:border-slate-800 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4 text-center">QR Icon</th>
                  <th className="py-3.5 px-4">Box ID</th>
                  <th className="py-3.5 px-4">Donor Name & Details</th>
                  <th className="py-3.5 px-4">Installed Location</th>
                  <th className="py-3.5 px-4">Geo Tracker Maps</th>
                  <th className="py-3.5 px-4">Field Dispatch</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Settings Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800 text-sm">
                {filteredBoxes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      <AlertTriangle className="w-8 h-8 text-zinc-300 mx-auto mb-2.5" />
                      <p className="font-semibold text-zinc-700 dark:text-zinc-350 font-sans">No physical donation boxes match query criteria.</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Deploy a new physical device box, or expand filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBoxes.map((box) => {
                    const collector = collectors.find((c) => c.id === box.collectorId);
                    const qrPreviewPayload = JSON.stringify({ box_id: box.id });

                    return (
                      <tr key={box.id} className="hover:bg-zinc-50/40 dark:hover:bg-slate-800/10 transition-colors font-medium">
                        <td className="py-4 px-4 text-center align-middle">
                          <button
                            onClick={() => handleShowQR(box)}
                            className="p-1 inline-block border border-zinc-200 dark:border-slate-705 bg-white rounded-md hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/10 transition-all cursor-pointer"
                            title="Generate & View QR Label"
                          >
                            <QRCodeImg value={qrPreviewPayload} size={32} />
                          </button>
                        </td>
                        <td className="py-4 px-4 align-middle font-mono font-bold text-zinc-900 dark:text-white">
                          {box.id}
                        </td>
                        <td className="py-4 px-4 align-middle">
                          <div className="font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{box.donorName}</div>
                          <div className="text-xs text-zinc-400 font-mono mt-1 inline-flex items-center gap-1 font-semibold">
                            <Phone className="w-3.5 h-3.5 text-zinc-350" />
                            <span>{box.contactNumber}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-middle text-zinc-650 dark:text-zinc-400">
                          <div className="flex items-center gap-1 italic">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{box.address}, <strong>{box.city}</strong></span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1 font-bold">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <span>Installed: {box.installationDate}</span>
                          </div>
                        </td>
                        {/* MAP Locator Link implementation */}
                        <td className="py-4 px-4 align-middle">
                          {box.mapLink ? (
                            <a
                              href={box.mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1 hover:font-bold bg-sky-50 dark:bg-sky-950/20 py-1.5 px-2.5 rounded-lg border border-sky-150 dark:border-sky-850 font-semibold"
                            >
                              <MapPin className="w-3.5 h-3.5 text-sky-500" />
                              View Map Loc
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">No Map Linked</span>
                          )}
                        </td>
                        <td className="py-4 px-4 align-middle">
                          {collector ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {collector.name}
                            </span>
                          ) : (
                            <span className="text-xs text-rose-500 font-bold">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4 align-middle text-center">
                          <span
                            className={`inline-block py-1 px-2.5 rounded-full text-[10px] font-bold tracking-wide ${
                              box.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-[#12221c] text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60'
                                : box.status === 'Inactive'
                                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                                : box.status === 'Damaged'
                                ? 'bg-amber-50 dark:bg-[#2c2214] text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60'
                                : 'bg-rose-50 dark:bg-[#2f141a] text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60'
                            }`}
                          >
                            {box.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle text-rightAll text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleShowQR(box)}
                              className="p-1.5 bg-zinc-50 dark:bg-slate-900 border border-zinc-150 dark:border-slate-800 text-zinc-500 dark:text-zinc-400 rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition cursor-pointer"
                              title="Print Secure Label"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditForm(box)}
                              className="p-1.5 bg-zinc-50 dark:bg-slate-900 border border-zinc-150 dark:border-slate-800 text-zinc-500 dark:text-zinc-400 rounded-lg hover:border-blue-300 hover:text-blue-600 transition cursor-pointer"
                              title="Edit device configuration"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Decommission box placement index ${box.id}? This will remove transaction tags.`)) {
                                  deleteDonationBox(box.id);
                                }
                              }}
                              className="p-1.5 bg-zinc-50 dark:bg-slate-900 border border-zinc-150 dark:border-slate-800 text-zinc-550 dark:text-zinc-400 rounded-lg hover:border-rose-300 hover:text-rose-600 transition cursor-pointer"
                              title="Purge box deployment"
                            >
                              <Trash2 className="w-4 h-4" />
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
      ) : (
        /* RENDER SUB-VIEW 2: UNIFIED HOST PARTNERS & HOLOGRAM STICKER DECOMMISSION TABLE (Replaces CustomerList.tsx!) */
        <div className="bg-white dark:bg-[#121826] rounded-xl border border-zinc-150 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-150">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-slate-900/50 border-b border-zinc-100 dark:border-slate-800 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Hosting Store / Corporate Partner</th>
                  <th className="py-3.5 px-6">Customer Contact</th>
                  <th className="py-3.5 px-6">Assigned Dispatcher</th>
                  <th className="py-3.5 px-6 text-center">Hologram Secure Sticker Status</th>
                  <th className="py-3.5 px-6 text-right">Sticker Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800 font-medium text-slate-808 dark:text-zinc-200">
                {filteredBoxes.map((box) => {
                  const dispatcher = collectors.find((c) => c.id === box.collectorId);
                  const isStickerRemoved = box.status === 'Inactive';

                  return (
                    <tr key={box.id} className="hover:bg-zinc-50/40 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-4.5 px-6 align-middle font-semibold text-zinc-900 dark:text-white">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 text-slate-600 mt-0.5">
                            <Building className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <span className="block text-slate-800 dark:text-zinc-100 font-bold leading-none">{box.donorName}</span>
                            <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1 font-semibold font-mono">
                              <MapPin className="w-3 h-3 text-zinc-400" />
                              {box.address}, {box.city}
                            </div>
                            {box.mapLink && (
                              <a
                                href={box.mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 mt-1 font-mono font-bold"
                              >
                                Google Maps locator address Link &rarr;
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-zinc-650 dark:text-zinc-400 text-xs">
                        <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-zinc-300">
                          <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{box.contactNumber}</span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 block mt-1 tracking-wide font-bold">EST. REGISTRATION: {box.installationDate}</span>
                      </td>
                      <td className="py-4.5 px-6 align-middle text-zinc-550 dark:text-zinc-400 text-xs">
                        <span className="font-bold text-slate-700 dark:text-zinc-300 block">
                          {dispatcher ? dispatcher.name : 'Unassigned'}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono tracking-wider">
                          Dispatcher {box.collectorId}
                        </span>
                      </td>
                      
                      {/* Secure QR Sticker Status */}
                      <td className="py-4.5 px-6 align-middle text-center">
                        {isStickerRemoved ? (
                          <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-rose-50 dark:bg-[#2e1419] border border-rose-200 dark:border-[#52131f] text-rose-700 dark:text-rose-400 text-[10px] font-mono font-bold uppercase rounded-full">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Sticker Decommissioned
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleShowQR(box)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 dark:bg-[#12221c] hover:bg-emerald-100/60 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-[#213e31] text-emerald-800 dark:text-emerald-400 transition text-[10px] font-mono font-black uppercase rounded-full cursor-pointer shadow-3xs"
                            title="Click to Open Secure Holographic QR Sticker Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Authorized QR Content: {box.id}</span>
                          </button>
                        )}
                      </td>

                      {/* Remove / Decommission QR Sticker Actions (explicitly requested) */}
                      <td className="py-4.5 px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isStickerRemoved ? (
                            <>
                              <button
                                onClick={() => handleShowQR(box)}
                                className="px-2.5 py-1.5 border border-sky-200 dark:border-sky-850 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-450 hover:bg-sky-100 rounded-lg text-xs transition font-semibold cursor-pointer"
                              >
                                View sticker
                              </button>
                              <button
                                onClick={() => handleRemoveSticker(box)}
                                className="p-1 px-2 border border-rose-200 dark:border-[#5c1a26] hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg transition font-bold text-xs flex items-center gap-1 cursor-pointer"
                                title="Nullify sticker association"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove QR Sticker
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRestoreSticker(box)}
                              className="px-3 py-1.5 bg-zinc-100 dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 hover:bg-zinc-200 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-bold cursor-pointer transition-all"
                            >
                              Restore QR Sticker
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Creation / Edit Form Modal incorporating Google Maps Link */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-zinc-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Building className="w-5 h-5 text-emerald-600" />
                {editingBox ? `Modify Donor & Box (${editingBox.id})` : 'Onboard New Partner Outlet & Box'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-5.5 space-y-4 max-h-[75vh] overflow-y-auto">
              {!editingBox && (
                <div className="p-3.5 bg-emerald-50/50 dark:bg-[#12221c]/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-805 dark:text-emerald-400 font-medium">
                  <span className="font-extrabold uppercase tracking-wider block mb-0.5">Secure sticker Auto-Generation:</span>
                  Adding a partner automatically initiates their associated entry and generates their encrypted, unique Secure QR Code sticker label.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="donorName">
                  Donor Shop / Hosting Organization Name *
                </label>
                <input
                  id="donorName"
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Grand Al-Shaheen Sweets or Cafe Delight"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="contactNumber">
                    Contact Phone Number *
                  </label>
                  <input
                    id="contactNumber"
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +92 (300) 555-0922"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="city">
                    Target Operating City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Houston"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="address">
                  Street / Plaza / Cash Register Address *
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Northwest Commercial Lane, Sector 4-G"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                />
              </div>

              {/* REQUESTED MAP LINK LOCATOR FIELD */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="mapLink">
                  Interactive Google Maps Location Link (Optional)
                </label>
                <input
                  id="mapLink"
                  type="url"
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  placeholder="e.g. https://maps.app.goo.gl/abcdefg"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-1 leading-normal font-medium">
                  Used by collectors on route layouts to directly open navigation.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="collectorId">
                    Assigned Dispatch (Collector) *
                  </label>
                  <select
                    id="collectorId"
                    required
                    value={collectorId}
                    onChange={(e) => setCollectorId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-205 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-808 dark:text-white shadow-3xs"
                  >
                    <option value="">-- Select Staff --</option>
                    {collectors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.status === 'Disabled' ? '(Disabled)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="installationDate">
                    Installation Date
                  </label>
                  <input
                    id="installationDate"
                    type="date"
                    required
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {editingBox && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="status">
                    Box Operational Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DonationBox['status'])}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-205 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-808 dark:text-white shadow-3xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive (Dormant)</option>
                    <option value="Damaged">Damaged Panel / Cracked Acrylic</option>
                    <option value="Missing">Reported Missing / Displaced</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-430 mb-1" htmlFor="notes">
                  Placements & Security Notes (Specific Details)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Keys managed by cashier. Placed next to checkout register 4..."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3.5 border-t border-zinc-150 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-slate-750 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-650 hover:bg-emerald-750 text-white rounded-lg text-xs font-extrabold cursor-pointer transition shadow-xs"
                >
                  {editingBox ? 'Save Configuration' : 'Confirm & Print Secure Sticker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Security Dropdown Viewer Dialog Modal */}
      {selectedBox && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-zinc-200 dark:border-slate-800 w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-zinc-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <QrCode className="w-5 h-5 text-emerald-600 animate-pulse" />
                Active Secure QR Tag
              </h2>
              <button
                onClick={() => setSelectedBox(null)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {/* Box Card Layout preview */}
              <div className="p-5.5 border-2 border-emerald-500 rounded-2xl bg-white shadow-md max-w-xs w-full text-zinc-900 border-dashed relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-[9px] text-white font-mono uppercase tracking-widest px-3 py-0.5 rounded-full font-black">
                  NGO Device
                </span>

                <div className="text-[11px] font-bold text-center text-emerald-700 tracking-wide mb-1 uppercase">
                  Al-Najaat Social Care
                </div>
                
                <div className="my-4.5 flex items-center justify-center bg-[#FDFDFD] p-3 border border-slate-100 rounded-xl shadow-inner">
                  <QRCodeImg value={qrPayload} size={150} />
                </div>

                <div className="font-mono font-bold text-lg text-zinc-900 tracking-wider">
                  {selectedBox.id}
                </div>
                <div className="font-extrabold text-sm text-zinc-800 truncate mt-1">
                  {selectedBox.donorName}
                </div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {selectedBox.address}, {selectedBox.city}
                </div>
              </div>

              {/* Encrypted Data explanation */}
              <div className="bg-zinc-50 dark:bg-slate-900/60 border border-zinc-200 dark:border-slate-800 rounded-xl p-3.5 text-left mt-4 w-full">
                <span className="text-[9px] font-mono font-extrabold text-emerald-700 dark:text-emerald-400 uppercase block tracking-wide">Encrypted Token Payload:</span>
                <p className="text-[10.5px] text-zinc-450 dark:text-slate-400 mt-1 leading-normal font-semibold">
                  MAPPED STATE: <code className="font-mono text-[9.5px] bg-zinc-150/60 dark:bg-slate-800 text-zinc-700 dark:text-zinc-200 p-0.5 rounded font-black">{"{"}"box_id":"{selectedBox.id}"{"}"}</code>.<br/>
                  Anti-fraud token binds individual collector collection scan limits autonomously.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 w-full mt-5">
                <button
                  type="button"
                  onClick={() => handlePrintLabelPrinters(selectedBox)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-250 dark:border-slate-750 bg-white dark:bg-slate-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print sticker
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadLabelPDF(selectedBox)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BoxManagement;
