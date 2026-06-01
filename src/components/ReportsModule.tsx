/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import {
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  Calendar,
  Wallet,
  Settings,
  ShieldCheck,
  TrendingUp,
  Percent,
  PlusSquare,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';

export const ReportsModule: React.FC = () => {
  const { collections, totalExpenses, commissionRate, expenses, updateExpenseStatus } = useNGOStore();

  const [dateScope, setDateScope] = useState<'All' | 'May2026' | 'June2026'>('All');

  // Filter collections by selected period
  const filteredCollections = collections.filter((item) => {
    if (dateScope === 'May2026') {
      return item.date.startsWith('2026-05');
    }
    if (dateScope === 'June2026') {
      return item.date.startsWith('2026-06');
    }
    return true; // All
  });

  // Calculations
  const calculatedTotalAmount = filteredCollections.reduce((sum, item) => sum + item.amount, 0);
  const currentExpenses = totalExpenses;
  const calculatedCommission = calculatedTotalAmount * commissionRate; // 15%
  const calculatedGrandTotal = calculatedTotalAmount - currentExpenses - calculatedCommission;

  // 1. Live Native system print dialogue triggers styled CSS print
  const handlePrintA4 = () => {
    window.print();
  };

  // 2. High fidelity PDF Generator using jsPDF
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Outer Border
    doc.setDrawColor(230, 230, 230);
    doc.rect(10, 10, 190, 277);

    // Decorative Sky Header Accent block
    doc.setFillColor(14, 116, 144); // Primary Sky Royal Blue
    doc.rect(10, 10, 190, 10, 'F');

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text('EcoGrowth Foundation Network', 15, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Official Box Donation Collections ledger & financial report audit.', 15, 40);

    // Report Metadata Meta info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(`DOC REF: REP-2026-06-01`, 140, 31);
    doc.setFont('helvetica', 'normal');
    doc.text(`Audit Date: June 1, 2026`, 140, 36);
    doc.text(`Period Scope: ${dateScope === 'All' ? 'All Operations' : dateScope}`, 140, 41);

    // Divider Line
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(15, 46, 195, 46);

    // Summary Statistics Header Blocks
    doc.setFillColor(249, 250, 251);
    doc.rect(15, 52, 180, 24, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(15, 52, 180, 24);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('GATHERED YIELD', 18, 59);
    doc.text('BOX MAINTENANCE', 65, 59);
    doc.text('15% STAFF COMM.', 112, 59);
    doc.text('NET ACCUMULATION', 155, 59);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(`$${calculatedTotalAmount.toFixed(2)}`, 18, 67);
    doc.setTextColor(190, 24, 74); // pinkish-rose for cost
    doc.text(`$${currentExpenses.toFixed(2)}`, 65, 67);
    doc.setTextColor(79, 70, 229); // indigo
    doc.text(`$${calculatedCommission.toFixed(2)}`, 112, 67);
    doc.setTextColor(14, 116, 144); // sky blue
    doc.text(`$${calculatedGrandTotal.toFixed(2)}`, 155, 67);

    // Table Content Header
    doc.setFillColor(243, 244, 246);
    doc.rect(15, 84, 180, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text('Donor Organization Shop Name', 18, 895, { baseline: 'middle' }); // Using small custom offset
    doc.text('Retail Installation Address', 90, 89.5, { baseline: 'middle' });
    doc.text('Amount ($)', 180, 89.5, { align: 'right', baseline: 'middle' });

    // Table rows looping
    let currentY = 96;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);

    filteredCollections.forEach((item, index) => {
      // Background shading for alternates
      if (index % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(15, currentY - 4, 180, 7.5, 'F');
      }

      // Draw text
      doc.setFont('helvetica', 'bold');
      doc.text(
        item.donorName.length > 35 ? item.donorName.substring(0, 33) + '...' : item.donorName,
        18,
        currentY
      );
      doc.setFont('helvetica', 'normal');
      doc.text(
        item.address.length > 45 ? item.address.substring(0, 42) + '...' : item.address,
        90,
        currentY
      );
      doc.text(`$${item.amount.toFixed(2)}`, 180, currentY, { align: 'right' });

      currentY += 7.5;
    });

    // Formulary Total Block Draw in target position (Bottom)
    currentY += 10;
    doc.setDrawColor(210, 210, 210);
    doc.line(15, currentY, 195, currentY);

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Gross Accumulated Box Collections:', 110, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`$${calculatedTotalAmount.toFixed(2)}`, 180, currentY, { align: 'right' });

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Less: Physical Box Expenses:', 110, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${currentExpenses.toFixed(2)}`, 180, currentY, { align: 'right' });

    currentY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Less: 15% Field Staff Comm Allocation:', 110, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${calculatedCommission.toFixed(2)}`, 180, currentY, { align: 'right' });

    currentY += 4;
    doc.line(110, currentY, 180, currentY);

    currentY += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(14, 116, 144);
    doc.text('GRAND NET NGO AMOUNT:', 110, currentY);
    doc.text(`$${calculatedGrandTotal.toFixed(2)}`, 180, currentY, { align: 'right' });

    // Official signature placeholder
    currentY += 26;
    
    // Guardian signature
    doc.line(15, currentY, 70, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('NGO TRUSTEE AUDITOR', 15, currentY + 4);
    
    // Date
    doc.line(125, currentY, 180, currentY);
    doc.text('DATE RELEASED', 125, currentY + 4);

    doc.save(`EcoGrowth_Donations_Report_${dateScope}.pdf`);
  };

  // 3. Export Excel Spreadsheet trigger (Custom formatted functional CSV download)
  const handleExportExcel = () => {
    // Columns: Donor Name | Address | Amount
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Donor Name,Address,Collection Amount ($)\n';

    filteredCollections.forEach((row) => {
      // Escape commas
      const escapedName = `"${row.donorName.replace(/"/g, '""')}"`;
      const escapedAddress = `"${row.address.replace(/"/g, '""')}"`;
      csvContent += `${escapedName},${escapedAddress},${row.amount.toFixed(2)}\n`;
    });

    // Add empty spacer and bottom sums matching standard layouts
    csvContent += '\n';
    csvContent += `Total Amount,,${calculatedTotalAmount.toFixed(2)}\n`;
    csvContent += `Total Expenses,,${currentExpenses.toFixed(2)}\n`;
    csvContent += `15% Commission Rate,,${calculatedCommission.toFixed(2)}\n`;
    csvContent += `Grand Total Amount,,${calculatedGrandTotal.toFixed(2)}\n`;
    csvContent += `Formula applied:, Grand Total = Total Amount - Total Expenses - 15% Commission\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EcoGrowth_Donations_Report_${dateScope}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upper action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Audit Report Compiler</h1>
          <p className="text-sm text-zinc-500">Formulates division reports, modifies expense parameters, and outputs printable files.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Native Print Trigger */}
          <button
            onClick={handlePrintA4}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            Print Report
          </button>
          
          {/* Download PDF Trigger */}
          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>

          {/* Excel CSV Trigger */}
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 border border-sky-250 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            Excel Export
          </button>
        </div>
      </div>

      {/* Control scope selector and Expense modifier cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter / Scope Box */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-800 mb-1 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-zinc-450" />
              Reporting Cycle Target
            </h2>
            <p className="text-xs text-zinc-500">Determine which historic dates should compile into the ledger report below.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {(
              [
                { key: 'All', label: 'All Time' },
                { key: 'May2026', label: 'May 2026' },
                { key: 'June2026', label: 'June 2026' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateScope(opt.key)}
                className={`py-2 text-xs font-semibold rounded-lg transition border ${
                  dateScope === opt.key
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Claim Auditor Box */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-800 mb-1 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-sky-600 shrink-0" />
              Field Expense Auditor
            </h2>
            <p className="text-xs text-zinc-400 leading-normal mb-3">Approve/reject field expense claims (e.g. petrol, punctures) submitted by collectors.</p>
            
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div key={exp.id} className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-[10px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{exp.category}</span>
                    <span className="font-mono text-zinc-400 font-medium uppercase font-black">{exp.id}</span>
                  </div>
                  <div className="text-zinc-500 leading-normal">{exp.description}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono text-sky-700 font-extrabold">${exp.amount.toFixed(2)}</span>
                    <div className="flex gap-1.5">
                      {exp.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => updateExpenseStatus(exp.id, 'Approved')}
                            className="text-[9px] font-bold text-sky-600 hover:underline px-1 py-0.5 rounded cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateExpenseStatus(exp.id, 'Rejected')}
                            className="text-[9px] font-bold text-rose-600 hover:underline px-1 py-0.5 rounded cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`text-[8px] font-bold uppercase rounded px-1.5 py-0.25 text-white ${
                          exp.status === 'Approved' ? 'bg-sky-600' : 'bg-rose-500'
                        }`}>
                          {exp.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-4 text-zinc-400 italic text-[11px]">
                  No expense claims to audit.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 font-sans text-xs">
            <span className="text-zinc-500 font-medium">Approved / Pending Ops Total:</span>
            <strong className="font-mono text-sm font-bold text-zinc-800">
              ${totalExpenses.toFixed(2)}
            </strong>
          </div>
        </div>

        {/* Formula Explainer Info */}
        <div className="bg-sky-950 p-5 rounded-2xl border border-sky-900 shadow-sm text-sky-100 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Percent className="w-4.5 h-4.5 text-sky-450" />
              Compliance Ledger Formula
            </h2>
            <code className="text-[10px] font-mono bg-sky-900/60 text-sky-200 p-1 rounded font-semibold block mt-2 whitespace-normal leading-normal">
              Grand Total = Total Amount - Total Expenses - 15% Commission
            </code>
          </div>
          <p className="text-[11px] text-sky-400/80 leading-normal mt-3">
            Commission matches 15% of compiled collections amount. Direct funding nets are logged accordingly.
          </p>
        </div>
      </div>

      {/* On-screen A4 Printable Sheet Preview representation */}
      <div className="bg-zinc-650 p-4 md:p-8 rounded-2xl border border-zinc-500 max-w-4xl mx-auto shadow-inner printable-paper-wrapper">
        <div className="bg-white p-6 md:p-12 shadow-2xl rounded-sm text-zinc-800 text-left relative mx-auto my-0 select-none border border-zinc-300/60 aspect-[1/1.414] w-full max-w-[210mm] printable-sheet" id="printable-area-a4">
          
          <div className="space-y-4">
            {/* Upper Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6.5 h-6.5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-md font-black tracking-tight text-zinc-950">EcoGrowth Trust NGO</h3>
                </div>
                <p className="text-[10px] text-zinc-450 leading-relaxed max-w-sm">
                  12 West Orchard Parkway, Sector 5-F, Illinois, USA.<br/>
                  Charity Licensing Board index: #NGO-IL-890281-B
                </p>
              </div>
              <div className="text-right sm:text-right w-full sm:w-auto mt-2 sm:mt-0 font-mono text-[10px] text-zinc-400">
                <span className="block font-bold text-zinc-800 uppercase tracking-wider text-xs font-sans">Official Audit</span>
                <span className="block mt-1">Ref ID: AUD-2026-A10</span>
                <span>Compiled: June 1, 2026</span>
              </div>
            </div>

            {/* Sub-label Title */}
            <div className="pt-2 text-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 border-b border-dashed border-zinc-200 pb-2">
                Donation Box Collections Reporting Ledger
              </h2>
              <span className="inline-block mt-1 font-mono text-[10px] text-zinc-400 font-semibold bg-zinc-50 py-0.5 px-2 rounded-md border border-zinc-150">
                Audit Scope Timeline: {dateScope === 'All' ? 'Complete Operations' : dateScope === 'May2026' ? 'May 1 – May 31, 2026' : 'June 1 – June 30, 2026'}
              </span>
            </div>

            {/* Main Table columns */}
            <div className="pt-3 min-h-[250px] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-250 bg-zinc-50 font-bold font-sans text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Donor Partner Shop</th>
                    <th className="py-2.5 px-3">Installation Address Location</th>
                    <th className="py-2.5 px-3 text-right">Cleared Yield Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-700">
                  {filteredCollections.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">{row.donorName}</td>
                      <td className="py-2.5 px-3 italic font-sans text-[11px] text-zinc-550">{row.address}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-zinc-900 font-mono">${row.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredCollections.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-400 italic">
                        No transactions registered under selected scope date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculus Math Bottom block */}
            <div className="pt-4 border-t-2 border-zinc-200 flex flex-col items-end gap-1 text-xs">
              <div className="w-full md:max-w-md space-y-1.5 font-sans leading-normal">
                {/* 1. Total */}
                <div className="flex justify-between text-zinc-550">
                  <span>Gross Compiled Collections Total:</span>
                  <strong className="text-zinc-800 font-mono font-medium">${calculatedTotalAmount.toFixed(2)}</strong>
                </div>
                {/* 2. Expenses */}
                <div className="flex justify-between text-zinc-550">
                  <span>Less: Operational Equipment / Box Expenses:</span>
                  <strong className="text-zinc-800 font-mono font-medium">-${currentExpenses.toFixed(2)}</strong>
                </div>
                {/* 3. 15% Commision */}
                <div className="flex justify-between text-zinc-550">
                  <span>Less: Field Commission (15% Operators Allocation):</span>
                  <strong className="text-zinc-800 font-mono font-medium">-${calculatedCommission.toFixed(2)}</strong>
                </div>
                {/* Divider */}
                <div className="border-t border-dashed border-zinc-250 my-1 pt-1"></div>
                {/* Grand Total */}
                <div className="flex justify-between items-center text-sm font-bold pt-0.5">
                  <span className="text-sky-850 uppercase tracking-wide font-sans font-bold">Grand Net NGO Amount:</span>
                  <strong className="text-sky-950 font-mono font-black text-base bg-sky-50 py-1 px-2.5 rounded-lg border border-sky-150">
                    ${calculatedGrandTotal.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-zinc-400 font-mono">
              <div className="text-center w-full sm:w-auto">
                <div className="border-t border-dashed border-zinc-300 w-44 mx-auto pb-1"></div>
                <span>TRUSTEE OFFICER SIGNATURE</span>
              </div>
              <p className="text-center italic max-w-xs text-[9px] text-zinc-350">
                EcoGrowth NGO holds continuous compliance audits. All amounts are calculated autonomously under strict ledger parameters.
              </p>
              <div className="text-center w-full sm:w-auto">
                <div className="border-t border-dashed border-zinc-300 w-44 mx-auto pb-1"></div>
                <span>AUDIT CLEARED TIMETAG</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default ReportsModule;
