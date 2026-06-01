/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { DonationBox } from '../types';
import { QRCodeImg } from './QRCodeImg';
import {
  QrCode,
  Printer,
  Download,
  Check,
  CheckSquare,
  Square,
  Search,
  Filter,
  X,
  RefreshCw,
  Eye,
  LayoutGrid,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';

export const QRManager: React.FC = () => {
  const { donationBoxes, updateDonationBox, addNotification } = useNGOStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Selection state for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Single preview
  const [previewBox, setPreviewBox] = useState<DonationBox | null>(null);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getSelectedBoxesList = () => {
    return donationBoxes.filter((b) => selectedIds[b.id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSel: Record<string, boolean> = {};
    if (isChecked) {
      filteredBoxes.forEach((b) => {
        newSel[b.id] = true;
      });
    }
    setSelectedIds(newSel);
  };

  // Regenerate QR Simulator (updates QR timestamp or status)
  const handleRegenerateQR = (box: DonationBox) => {
    if (confirm(`Regenerate digital identifier keys for Box ${box.id}? This will invalidate previous physical QR stickers.`)) {
      // Simulate regeneration
      addNotification(
        'issue',
        'QR Keys Regenerated',
        `A new secure identifier code was re-seeded for ${box.donorName} (${box.id}).`
      );
      
      const updated: DonationBox = {
        ...box,
        notes: `${box.notes || ''} [QR RE-KEYED ON JUNE 1, 2026]`,
      };
      updateDonationBox(updated);
      alert('Secure QR cryptographic token payload regenerated successfully!');
      
      if (previewBox?.id === box.id) {
        setPreviewBox(updated);
      }
    }
  };

  // Download Bulk Selected QR PDF
  const handleDownloadBulkPDF = () => {
    const selectedBoxes = getSelectedBoxesList();
    if (selectedBoxes.length === 0) {
      alert('Please select at least one donation box first.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(4, 120, 87);
    doc.text('EcoGrowth NGO Bulk Labels Sticker Sheet', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Grid Print Dispatch Order. Count: ${selectedBoxes.length} Labels. Arranged for cutting.`, 15, 26);
    doc.line(15, 30, 195, 30);

    // Loop through selected boxes and arrange in structured grid
    // Sticker layout: 2 columns of labels, A4 page size
    // Column width: 85mm, Height: 60mm
    let currentX = 15;
    let currentY = 38;
    const labelWidth = 85;
    const labelHeight = 60;
    const padding = 10;

    selectedBoxes.forEach((box, index) => {
      // Check if grid row fits on current page, else add new page
      if (currentY + labelHeight > 280) {
        doc.addPage();
        currentY = 20;
      }

      // Draw label frame border
      doc.setDrawColor(4, 120, 87);
      doc.setLineWidth(0.4);
      doc.rect(currentX, currentY, labelWidth, labelHeight);

      // Label letterhead text (centered)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(4, 120, 87);
      doc.text('ECOGROWTH FOUNDATION', currentX + labelWidth / 2, currentY + 8, { align: 'center' });

      // Label divider
      doc.setDrawColor(230, 230, 230);
      doc.line(currentX + 8, currentY + 12, currentX + labelWidth - 8, currentY + 12);

      // Draw simulated QR frame box to represent physical layout
      doc.rect(currentX + 8, currentY + 17, 26, 26);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(160, 160, 160);
      doc.text('QR SECURE', currentX + 21, currentY + 28, { align: 'center' });
      doc.text('KEY TOKEN', currentX + 21, currentY + 31, { align: 'center' });

      // Write descriptive box tags on the right of QR code frame
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(box.id, currentX + 38, currentY + 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(55, 65, 81);
      doc.text(box.donorName.length > 20 ? box.donorName.substring(0, 18) + '...' : box.donorName, currentX + 38, currentY + 28);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(box.address.length > 22 ? box.address.substring(0, 21) + '...' : box.address, currentX + 38, currentY + 34);
      doc.text(box.city, currentX + 38, currentY + 39);

      // Footer
      doc.setDrawColor(240, 240, 240);
      doc.line(currentX + 6, currentY + 48, currentX + labelWidth - 6, currentY + 48);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(180, 180, 180);
      doc.text('DO NOT TAMPER • COMPLIANT REGISTER', currentX + labelWidth / 2, currentY + 54, { align: 'center' });

      // Move layout cursor for the next sticker index
      if (index % 2 === 0) {
        // Shift column right
        currentX += labelWidth + padding;
      } else {
        // Shift row down and reset column left
        currentX = 15;
        currentY += labelHeight + padding;
      }
    });

    doc.save(`Bulk_Donation_QR_Labels_${selectedBoxes.length}.pdf`);
  };

  // Trigger A4 Multi-label print grid styled window
  const handlePrintBulkSelected = () => {
    const selectedBoxes = getSelectedBoxesList();
    if (selectedBoxes.length === 0) {
      alert('Please select at least one donation box first.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let itemsHtml = '';
    selectedBoxes.forEach((box) => {
      const payload = JSON.stringify({ box_id: box.id });
      itemsHtml += `
        <div class="label-box">
          <div className="ngo-tag">ECOGROWTH TRUST</div>
          <div class="qr-container" id="qr-element-${box.id}"></div>
          <div class="box-id">${box.id}</div>
          <div class="donor-name">${box.donorName}</div>
          <div class="address">${box.address}, ${box.city}</div>
          <div class="disclaimer">DO NOT TAMPER • STICKER LABEL</div>
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk Labels Print Grid</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background-color: #fff;
              color: #333;
            }
            h1 {
              font-size: 16px;
              border-bottom: 2px solid #047857;
              padding-bottom: 8px;
              color: #047857;
              text-align: center;
              margin-bottom: 24px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              max-width: 190mm;
              margin: 0 auto;
            }
            .label-box {
              border: 2px solid #047857;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              page-break-inside: avoid;
              background-color: #fff;
            }
            .ngo-tag {
              font-size: 9px;
              font-weight: bold;
              color: #047857;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 8px;
            }
            .qr-container {
              display: flex;
              justify-content: center;
              margin: 8px 0;
            }
            .box-id {
              font-size: 14px;
              font-weight: bold;
              color: #000;
              font-family: monospace;
              margin-bottom: 4px;
            }
            .donor-name {
              font-size: 11px;
              font-weight: bold;
              color: #333;
            }
            .address {
              font-size: 9px;
              color: #666;
              margin-top: 2px;
            }
            .disclaimer {
              font-size: 6px;
              color: #aaa;
              margin-top: 10px;
              border-top: 1px dashed #eee;
              padding-top: 6px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <h1>EcoGrowth Foundation - Bulk Physical Donation Box Grid Labels</h1>
          <div class="grid">
            ${itemsHtml}
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
          <script>
            ${selectedBoxes
              .map(
                (b) => `
              try {
                var qr = qrcode(4, 'M');
                qr.addData('${JSON.stringify({ box_id: b.id })}');
                qr.make();
                document.getElementById('qr-element-${b.id}').innerHTML = qr.createImgTag(3.5);
              } catch(e) {}
            `
              )
              .join('\n')}
            setTimeout(function() {
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredBoxes = donationBoxes.filter((box) => {
    const matchesSearch =
      box.id.toLowerCase().includes(search.toLowerCase()) ||
      box.donorName.toLowerCase().includes(search.toLowerCase()) ||
      box.address.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || box.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedBoxesCount = getSelectedBoxesList().length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">QR Security & Dispatch Stickers</h1>
          <p className="text-sm text-zinc-500">Monitor cryptographic tag values, trigger single prints, or batch-print multi-label grids.</p>
        </div>
      </div>

      {/* Bulk Action floating/sticky bar when selections exist */}
      {selectedBoxesCount > 0 && (
        <div className="bg-emerald-950 p-4 rounded-xl border border-emerald-950 shadow-md text-emerald-100 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-emerald-950/10 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2.5 text-sm">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>
              Selected <strong className="text-white font-mono">{selectedBoxesCount}</strong> donation boxes for mass physical labeling.
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedIds({})}
              className="px-3 py-1.5 border border-emerald-800 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold flex-1 sm:flex-none text-center"
            >
              Clear Selection
            </button>
            <button
              onClick={handlePrintBulkSelected}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Bulk Stickers
            </button>
            <button
              onClick={handleDownloadBulkPDF}
              className="px-3.5 py-1.5 bg-white text-emerald-900 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-none shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sticker PDF
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="bg-white p-4 rounded-xl border border-zinc-150 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search Box ID, store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto select-none">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 py-1.5 px-3 rounded-lg border border-zinc-200 hidden sm:flex">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Operational Status:</span>
          </div>

          {['All', 'Active', 'Damaged', 'Missing'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'
              }`}
            >
              {st} Boxes ({donationBoxes.filter(b => st === 'All' || b.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* QR List Table */}
      <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 text-center w-12">
                  <span className="sr-only">Checkboxes</span>
                </th>
                <th className="py-3.5 px-4 text-center">QR Icon</th>
                <th className="py-3.5 px-4">Donation Box</th>
                <th className="py-3.5 px-4">Encrypted QR Payload</th>
                <th className="py-3.5 px-4">Box Installation Status</th>
                <th className="py-3.5 px-4">Installation Date</th>
                <th className="py-3.5 px-4 text-right">Identifier Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filteredBoxes.map((box) => {
                const isSelected = !!selectedIds[box.id];
                const dataPayloadMock = JSON.stringify({ box_id: box.id });

                return (
                  <tr key={box.id} className={`hover:bg-zinc-50/55 transition-colors ${isSelected ? 'bg-emerald-50/20' : ''}`}>
                    <td className="py-4 px-4 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(box.id)}
                        className="text-zinc-400 hover:text-emerald-700 block mx-auto cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="inline-block p-1 bg-zinc-50 rounded border border-zinc-200">
                        <QRCodeImg value={dataPayloadMock} size={30} />
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <div className="font-bold text-zinc-900 font-mono tracking-tight">{box.id}</div>
                      <div className="text-xs text-zinc-500 font-medium">{box.donorName}</div>
                      <div className="text-[10px] text-zinc-450 mt-0.5">{box.address}</div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <code className="text-xs font-mono bg-zinc-100 py-1 px-1.5 rounded text-emerald-800">
                        {dataPayloadMock}
                      </code>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <span
                        className={`inline-block py-0.5 px-2 bg-zinc-50 text-[11px] font-mono rounded-full font-bold ${
                          box.status === 'Active'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                            : 'text-amber-700 bg-amber-50 border border-amber-100'
                        }`}
                      >
                        {box.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-middle font-mono text-zinc-500 text-xs">
                      {box.installationDate}
                    </td>
                    <td className="py-4 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewBox(box)}
                          className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-xs transition"
                          title="View Digital Box Details"
                        >
                          View Tag
                        </button>
                        <button
                          onClick={() => handleRegenerateQR(box)}
                          className="p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-650 border border-zinc-200 rounded transition"
                          title="Regenerate QR Key"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBoxes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <AlertTriangle className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-semibold text-zinc-700">No box tags found.</p>
                    <p className="text-xs text-zinc-400">Expand status filters to see inactive lists.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Detail Dialog Preview */}
      {previewBox && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h2 className="text-md font-bold text-zinc-900 flex items-center gap-1.5">
                <QrCode className="w-5 h-5 text-emerald-600" />
                Crypto Identifier Info
              </h2>
              <button
                onClick={() => setPreviewBox(null)}
                className="text-zinc-400 hover:text-zinc-655 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {/* Printed frame representation */}
              <div className="p-5 border-2 border-emerald-600 rounded-2xl bg-white w-full max-w-xs relative text-zinc-950 border-dotted shadow-inner">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-[9px] text-white font-mono px-2 py-0.5 rounded-full font-semibold">
                  STICKER LABEL
                </span>
                <span className="block text-[10px] font-sans font-bold text-emerald-700 tracking-wider">ECOGROWTH NGO MANAGEMENT</span>
                
                <div className="my-3 flex items-center justify-center">
                  <QRCodeImg value={JSON.stringify({ box_id: previewBox.id })} size={150} />
                </div>

                <div className="font-mono font-bold text-base">{previewBox.id}</div>
                <div className="font-semibold text-xs text-zinc-700">{previewBox.donorName}</div>
                <div className="text-[10px] text-zinc-450 mt-0.5">{previewBox.address}, {previewBox.city}</div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-2 gap-2 w-full mt-5">
                <button
                  onClick={() => {
                    setPreviewBox(null);
                    alert("PDF layout compiled! Check downloaded document files.");
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 rounded-lg text-xs font-semibold shadow-inner"
                >
                  <Download className="w-3.5 h-3.5" />
                  Sticker A4
                </button>
                <button
                  onClick={() => handleRegenerateQR(previewBox)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-once" />
                  Regen Keys
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default QRManager;
