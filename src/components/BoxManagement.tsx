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
  Paperclip,
  Check,
  Printer,
  Download,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import jsPDF from 'jspdf';

export const BoxManagement: React.FC = () => {
  const { donationBoxes, collectors, createDonationBox, updateDonationBox, deleteDonationBox } = useNGOStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
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
      };
      updateDonationBox(updated);
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

  // Print individual label Simulator
  const handlePrintLabelPrinters = (box: DonationBox) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Secure payload
    const payload = JSON.stringify({ box_id: box.id });
    const qrImageSize = 140;

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
            .label {
              background: white;
              border: 2px solid #047857;
              border-radius: 12px;
              padding: 24px;
              width: 320px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .header {
              font-size: 14px;
              font-weight: bold;
              color: #047857;
              margin-bottom: 4px;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            .sub-header {
              font-size: 10px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .qr-wrapper {
              display: flex;
              justify-content: center;
              margin-bottom: 16px;
            }
            .box-id {
              font-size: 18px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 4px;
            }
            .donor-name {
              font-size: 12px;
              font-weight: 500;
              color: #374151;
            }
            .location {
              font-size: 10px;
              color: #6b7280;
              margin-top: 2px;
            }
            .footer {
              font-size: 8px;
              color: #9ca3af;
              margin-top: 16px;
              border-top: 1px dashed #e5e7eb;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">EcoGrowth NGO Network</div>
            <div class="sub-header">Official Box Secure Tag</div>
            <div class="qr-wrapper" id="qr-target"></div>
            <div class="box-id">${box.id}</div>
            <div class="donor-name">${box.donorName}</div>
            <div class="location">${box.address}, ${box.city}</div>
            <div class="footer">DO NOT DAMPER • AUDITED PLACEMENT DEVICE</div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
          <script>
            // generate standard qr instantly
            try {
              var qr = qrcode(4, 'M');
              qr.addData('${payload}');
              qr.make();
              document.getElementById('qr-target').innerHTML = qr.createImgTag(5);
            } catch(e) {
              document.getElementById('qr-target').innerText = "QR Load Error";
            }
            window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download individual label PDF Simulator
  const handleDownloadLabelPDF = (box: DonationBox) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a6', // standard label paper size
    });

    const payload = JSON.stringify({ box_id: box.id });

    // Draw frame
    doc.setDrawColor(4, 120, 87);
    doc.setLineWidth(1);
    doc.rect(5, 5, 95, 138);

    // Organization details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(4, 120, 87);
    doc.text('ECOGROWTH NGO NETWORK', 52.5, 18, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('OFFICIAL BOX DONATION TRACER', 52.5, 24, { align: 'center' });

    // Placement Line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.25);
    doc.line(12, 28, 93, 28);

    // Box details text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text(box.id, 52.5, 38, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(box.donorName, 52.5, 46, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`${box.address}, ${box.city}`, 52.5, 52, { align: 'center' });

    // Simulating QR embedding in jsPDF (in label size)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.rect(26, 60, 53, 53);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('[QR Security Token Payload]', 52.5, 84, { align: 'center' });
    doc.setFontSize(6);
    doc.text(`ID: ${box.id}`, 52.5, 90, { align: 'center' });

    // Bottom notes
    doc.setDrawColor(220, 220, 220);
    doc.line(12, 120, 93, 120);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('AUDITED DEVICE - FIELD PROTOCOL REQUIRED', 52.5, 127, { align: 'center' });
    doc.setFontSize(6);
    doc.text(`PRINTED ON: JUNE 1, 2026`, 52.5, 132, { align: 'center' });

    doc.save(`BOX_LABEL_${box.id}.pdf`);
  };

  // Filter and search
  const filteredBoxes = donationBoxes.filter((box) => {
    const matchesSearch =
      box.id.toLowerCase().includes(search.toLowerCase()) ||
      box.donorName.toLowerCase().includes(search.toLowerCase()) ||
      box.address.toLowerCase().includes(search.toLowerCase()) ||
      box.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || box.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Donation Box Security Devices</h1>
          <p className="text-sm text-zinc-500">Track box locations, assign field collectors, and generate scan labels.</p>
        </div>
        <button
          onClick={handleOpenCreateForm}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm text-center shadow-sm w-full sm:w-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          Install Donation Box
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-150 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search Box ID, store name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 py-1 px-2.5 rounded-lg border border-zinc-200 w-max shrink-0 self-center hidden sm:flex">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Filters:</span>
          </div>

          {['All', 'Active', 'Inactive', 'Damaged', 'Missing'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                statusFilter === st
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-55'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Listing Grid / Table */}
      <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 text-center">QR Code</th>
                <th className="py-3.5 px-4">Box ID</th>
                <th className="py-3.5 px-4">Donor Name & Details</th>
                <th className="py-3.5 px-4">Installed Location</th>
                <th className="py-3.5 px-4">Field Dispatch</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Label Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredBoxes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <AlertTriangle className="w-8 h-8 text-zinc-300 mx-auto mb-2.5" />
                    <p className="font-semibold text-zinc-700">No donation boxes match criteria.</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Install a new box or widen search parameters.</p>
                  </td>
                </tr>
              ) : (
                filteredBoxes.map((box) => {
                  const collector = collectors.find((c) => c.id === box.collectorId);
                  const qrPreviewPayload = JSON.stringify({ box_id: box.id });

                  return (
                    <tr key={box.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4 text-center align-middle">
                        <button
                          onClick={() => handleShowQR(box)}
                          className="p-1 inline-block border border-zinc-200 bg-white rounded hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/10 transition-all cursor-pointer"
                          title="Generate & View QR Label"
                        >
                          <QRCodeImg value={qrPreviewPayload} size={36} />
                        </button>
                      </td>
                      <td className="py-4 px-4 align-middle font-mono font-bold text-zinc-900">
                        {box.id}
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <div className="font-semibold text-zinc-800">{box.donorName}</div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5 inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{box.contactNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle text-zinc-650">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{box.address}, <strong>{box.city}</strong></span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Installed: {box.installationDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        {collector ? (
                          <span className="inline-flex items-center gap-1 text-xs text-zinc-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {collector.name}
                          </span>
                        ) : (
                          <span className="text-xs text-rose-500 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-4 align-middle text-center">
                        <span
                          className={`inline-block py-1 px-2.5 rounded-full text-xs font-semibold ${
                            box.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : box.status === 'Inactive'
                              ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              : box.status === 'Damaged'
                              ? 'bg-amber-50 text-amber-800 border-amber-100'
                              : 'bg-rose-50 text-rose-800 border border-rose-100'
                          }`}
                        >
                          {box.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleShowQR(box)}
                            className="p-1.5 bg-zinc-50 border border-zinc-150 rounded-lg hover:border-emerald-300 hover:bg-emerald-100/10 text-emerald-700 transition"
                            title="Print Label Dialog"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(box)}
                            className="p-1.5 bg-zinc-50 border border-zinc-150 rounded-lg hover:border-blue-300 hover:bg-blue-100/10 text-blue-700 transition"
                            title="Edit Device Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove box location reference ${box.id}? This will purge historic indexes.`)) {
                                deleteDonationBox(box.id);
                              }
                            }}
                            className="p-1.5 bg-zinc-50 border border-zinc-150 rounded-lg hover:border-rose-300 hover:bg-rose-100/10 text-rose-700 transition"
                            title="Delete Dispatch"
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

      {/* Creation / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">
                {editingBox ? `Modify Box Location Info (${editingBox.id})` : 'Install New Donation Box Device'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {!editingBox && (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Secure QR Auto-Assignment:</span>
                  Upon installation approval, the system generates a secure tracking token payload mapping only its Box ID.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="donorName">
                  Donor Shop / Corporate Organization *
                </label>
                <input
                  id="donorName"
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Grand Landmark Pharmacy"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="contactNumber">
                    Contact Phone Number *
                  </label>
                  <input
                    id="contactNumber"
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 555-0199"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="city">
                    Target City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Chicago"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="address">
                  St Floor / Main Entrance Address *
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Suite B-12, 10th Commercial St."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="collectorId">
                    Assigned Dispatcher *
                  </label>
                  <select
                    id="collectorId"
                    required
                    value={collectorId}
                    onChange={(e) => setCollectorId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                  >
                    <option value="">-- Choose Staff --</option>
                    {collectors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.status === 'Disabled' ? '(Disabled)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="installationDate">
                    Installation Date
                  </label>
                  <input
                    id="installationDate"
                    type="date"
                    required
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                  />
                </div>
              </div>

              {editingBox && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="status">
                    Box Operational Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DonationBox['status'])}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive (Dormant)</option>
                    <option value="Damaged">Damaged Hangers / Panel</option>
                    <option value="Missing">Reported Missing / Displaced</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1" htmlFor="notes">
                  Technical Hanger Notes / Custom Placement Instruction
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Safe position, high camera observation. Keys managed by checkout leader..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs"
                >
                  {editingBox ? 'Save Configuration' : 'Confirm & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Preview Dialog Modal */}
      {selectedBox && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h2 className="text-md font-bold text-zinc-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                Secure Donation Box QR Tag
              </h2>
              <button
                onClick={() => setSelectedBox(null)}
                className="text-zinc-400 hover:text-zinc-650 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {/* Box Label card */}
              <div className="p-5 border-2 border-emerald-600 rounded-2xl bg-white shadow-inner max-w-xs w-full text-zinc-900 border-dashed relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-[9px] text-white font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold">
                  NGO Device
                </span>

                <div className="text-xs font-bold text-emerald-700 font-sans tracking-wide mb-1 uppercase">
                  EcoGrowth NGO Network
                </div>
                
                <div className="my-4 flex items-center justify-center">
                  <QRCodeImg value={qrPayload} size={160} />
                </div>

                <div className="font-mono font-bold text-lg text-zinc-900 tracking-wider">
                  {selectedBox.id}
                </div>
                <div className="font-semibold text-sm text-zinc-800 mt-1">
                  {selectedBox.donorName}
                </div>
                <div className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                  {selectedBox.address}, {selectedBox.city}
                </div>
              </div>

              {/* Secure explanation */}
              <div className="bg-zinc-50 border border-zinc-200/50 rounded-xl p-3 text-left mt-4 w-full">
                <span className="text-[10px] font-mono font-semibold text-emerald-800 uppercase block">Secure Data Container:</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Contains: <code className="font-mono text-[10px] bg-zinc-100 text-zinc-700 p-0.5 rounded">{"{"}"box_id":"{selectedBox.id}"{"}"}</code>. 
                  Field users scanning this QR automatically fetch secure, encrypted partner records in real-time.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 w-full mt-5">
                <button
                  onClick={() => handlePrintLabelPrinters(selectedBox)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-250 bg-white hover:bg-zinc-50 rounded-lg text-xs font-medium text-zinc-600 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Label
                </button>
                <button
                  onClick={() => handleDownloadLabelPDF(selectedBox)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-medium text-white shadow-sm transition"
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
