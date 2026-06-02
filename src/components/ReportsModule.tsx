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
  Sparkles,
  Search,
  Filter,
  User,
  MapPin,
  DollarSign,
  AlertTriangle,
  History,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ReportsModuleProps {
  defaultTab?: 'report' | 'ledger';
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ defaultTab = 'report' }) => {
  const { collections, totalExpenses, commissionRate, expenses, updateExpenseStatus, collectors, donationBoxes, sessionDate } = useNGOStore();

  const [activeCompilerTab, setActiveCompilerTab] = useState<'report' | 'ledger'>(defaultTab);

  React.useEffect(() => {
    setActiveCompilerTab(defaultTab);
  }, [defaultTab]);
  type DateScope = 'All' | 'previousMonth' | 'currentMonth';
  const [dateScope, setDateScope] = useState<DateScope>('All');

  // Ledger Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectorId, setSelectedCollectorId] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Last7Days' | 'Last30Days'>('All');

  // unique cities
  const cities = Array.from(new Set(donationBoxes.map((b) => b.city)));

  // Report scope collections
  const reportCollections = collections.filter((item) => {
    if (dateScope === 'previousMonth') {
      return item.date.startsWith(sessionDate.previousMonthKey);
    }
    if (dateScope === 'currentMonth') {
      return item.date.startsWith(sessionDate.monthKey);
    }
    return true;
  });

  const dateScopeTimelineLabel =
    dateScope === 'All'
      ? 'Complete Operations'
      : dateScope === 'previousMonth'
        ? sessionDate.previousMonthLabel
        : sessionDate.monthLabel;

  // Calculations for Reports
  const calculatedTotalAmount = reportCollections.reduce((sum, item) => sum + item.amount, 0);
  const currentExpenses = totalExpenses;
  const calculatedCommission = calculatedTotalAmount * commissionRate; // 15%
  const calculatedGrandTotal = calculatedTotalAmount - currentExpenses - calculatedCommission;

  // Ledger Filter logic
  const ledgerCollections = collections.filter((item) => {
    const searchLow = searchQuery.toLowerCase();
    const matchesSearch =
      item.donorName.toLowerCase().includes(searchLow) ||
      item.address.toLowerCase().includes(searchLow) ||
      item.boxId.toLowerCase().includes(searchLow) ||
      item.id.toLowerCase().includes(searchLow) ||
      item.collectorName.toLowerCase().includes(searchLow);

    const matchesCollector =
      selectedCollectorId === 'All' || item.collectorId === selectedCollectorId;

    let matchesCity = true;
    if (selectedCity !== 'All') {
      const box = donationBoxes.find((b) => b.id === item.boxId);
      matchesCity = box ? box.city === selectedCity : false;
    }

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

  const totalAmountLedger = ledgerCollections.reduce((acc, curr) => acc + curr.amount, 0);

  // Print PDF/Excel Handlers
  const handlePrintA4 = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    doc.setDrawColor(230, 230, 230);
    doc.rect(10, 10, 190, 277);

    doc.setFillColor(14, 116, 144);
    doc.rect(10, 10, 190, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text('EcoGrowth Foundation Network', 15, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Official Box Donation Collections ledger & financial report audit.', 15, 40);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text(`DOC REF: REP-${sessionDate.iso}`, 140, 31);
    doc.setFont('helvetica', 'normal');
    doc.text(`Audit Date: ${sessionDate.label}`, 140, 36);
    doc.text(`Period Scope: ${dateScope === 'All' ? 'All Operations' : dateScope}`, 140, 41);

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(15, 46, 195, 46);

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
    doc.setTextColor(190, 24, 74);
    doc.text(`$${currentExpenses.toFixed(2)}`, 65, 67);
    doc.setTextColor(79, 70, 229);
    doc.text(`$${calculatedCommission.toFixed(2)}`, 112, 67);
    doc.setTextColor(14, 116, 144);
    doc.text(`$${calculatedGrandTotal.toFixed(2)}`, 155, 67);

    doc.setFillColor(243, 244, 246);
    doc.rect(15, 84, 180, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text('Donor Organization Shop Name', 18, 89.5, { baseline: 'middle' });
    doc.text('Retail Installation Address', 90, 89.5, { baseline: 'middle' });
    doc.text('Amount ($)', 180, 89.5, { align: 'right', baseline: 'middle' });

    let currentY = 96;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);

    reportCollections.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(15, currentY - 4, 180, 7.5, 'F');
      }

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

    currentY += 26;
    doc.line(15, currentY, 70, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('NGO TRUSTEE AUDITOR', 15, currentY + 4);
    
    doc.line(125, currentY, 180, currentY);
    doc.text('DATE RELEASED', 125, currentY + 4);

    doc.save(`EcoGrowth_Donations_Report_${dateScope}.pdf`);
  };

  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Donor Name,Address,Collection Amount ($)\n';

    reportCollections.forEach((row) => {
      const escapedName = `"${row.donorName.replace(/"/g, '""')}"`;
      const escapedAddress = `"${row.address.replace(/"/g, '""')}"`;
      csvContent += `${escapedName},${escapedAddress},${row.amount.toFixed(2)}\n`;
    });

    csvContent += '\n';
    csvContent += `Total Amount,,${calculatedTotalAmount.toFixed(2)}\n`;
    csvContent += `Total Expenses,,${currentExpenses.toFixed(2)}\n`;
    csvContent += `15% Commission Rate,,${calculatedCommission.toFixed(2)}\n`;
    csvContent += `Grand Total Amount,,${calculatedGrandTotal.toFixed(2)}\n`;

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
      {/* Dynamic Tab Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Reports & Ledgers Hub</h1>
          <p className="text-sm text-zinc-500">Analyze compiled financial reports spreadsheet data alongside physical device scanned ledger traces.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 self-stretch sm:self-auto select-none">
          <button
            onClick={() => setActiveCompilerTab('report')}
            className={`flex-grow sm:flex-grow-0 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeCompilerTab === 'report'
                ? 'bg-white text-sky-750 shadow-xs border border-slate-250/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Reports Compiler
          </button>
          <button
            onClick={() => setActiveCompilerTab('ledger')}
            className={`flex-grow sm:flex-grow-0 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeCompilerTab === 'ledger'
                ? 'bg-white text-sky-750 shadow-xs border border-slate-250/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Collection Ledger Table
          </button>
        </div>
      </div>

      {activeCompilerTab === 'report' ? (
        /* TAB 1: REPORTS COMPILER & SPREADSHEET */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handlePrintA4}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-650 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              Print Report
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              Export PDF Layout
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 border border-sky-250 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              CSV Spreadsheet
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-850 mb-1 flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-zinc-450" />
                  Reporting Cycle Target
                </h2>
                <p className="text-xs text-zinc-450 leading-relaxed">Determine which historic dates should compile into the ledger report below.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {(
                  [
                    { key: 'All' as const, label: 'All Time' },
                    { key: 'previousMonth' as const, label: sessionDate.previousMonthLabel },
                    { key: 'currentMonth' as const, label: sessionDate.monthLabel },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setDateScope(opt.key)}
                    className={`py-2 text-xs font-bold rounded-lg transition border cursor-pointer ${
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

            <div className="bg-white p-5 rounded-2xl border border-zinc-150 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-850 mb-1 flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                  Field Expense Auditor
                </h2>
                <p className="text-xs text-zinc-440 leading-normal mb-3">Approve/reject field expense claims (e.g. petrol, punctures) submitted by collectors.</p>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="p-2 bg-slate-50 border border-slate-150 rounded-lg text-[10px] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{exp.category}</span>
                        <span className="font-mono text-zinc-400 font-medium uppercase font-black">{exp.id}</span>
                      </div>
                      <div className="text-zinc-500">{exp.description}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-mono text-sky-700 font-extrabold">${exp.amount.toFixed(2)}</span>
                        <div className="flex gap-1.5">
                          {exp.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => updateExpenseStatus(exp.id, 'Approved')}
                                className="text-[9px] font-bold text-sky-600 hover:underline px-1 py-0.5 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateExpenseStatus(exp.id, 'Rejected')}
                                className="text-[9px] font-bold text-rose-600 hover:underline px-1 py-0.5 cursor-pointer"
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
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 text-xs">
                <span className="text-zinc-500">Approved maintenance sum:</span>
                <strong className="font-mono text-sm font-bold text-zinc-800">${totalExpenses.toFixed(2)}</strong>
              </div>
            </div>

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
              <p className="text-[11px] text-sky-450 leading-relaxed mt-3 font-medium">
                Commission matches 15% of compiled collections amount. Direct funding nets are logged accordingly.
              </p>
            </div>
          </div>

          <div className="bg-zinc-650 p-4 md:p-8 rounded-2xl border border-zinc-500 max-w-4xl mx-auto shadow-inner printable-paper-wrapper">
            <div className="bg-white p-6 md:p-12 shadow-2xl rounded-sm text-zinc-800 text-left relative mx-auto my-0 select-none border border-zinc-300/60 aspect-[1/1.414] w-full max-w-[210mm] printable-sheet" id="printable-area-a4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6.5 h-6.5 rounded-full bg-sky-100 text-sky-750 flex items-center justify-center font-bold text-xs font-sans">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-md font-black tracking-tight text-zinc-950">EcoGrowth Trust NGO</h3>
                    </div>
                    <p className="text-[10px] text-zinc-450 leading-relaxed max-w-sm">
                      12 West Orchard Parkway, Sector 5-F, Illinois, USA.<br/>
                      Charity Licensing Board index: #NGO-IL-890281-B
                    </p>
                  </div>
                  <div className="text-right sm:text-right w-full sm:w-auto mt-2 sm:mt-0 font-mono text-[10px] text-zinc-450 font-medium">
                    <span className="block font-bold text-zinc-800 uppercase tracking-wider text-xs font-sans">Official Audit</span>
                    <span className="block mt-1">Ref ID: AUD-2026-A10</span>
                    <span>Compiled: {sessionDate.label}</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 border-b border-dashed border-zinc-200 pb-2 font-sans">
                    Donation Box Collections Reporting Ledger
                  </h2>
                  <span className="inline-block mt-1 font-mono text-[10px] text-zinc-450 font-bold bg-zinc-50 py-0.5 px-2.5 rounded-md border border-zinc-150">
                    Audit Scope Timeline: {dateScopeTimelineLabel}
                  </span>
                </div>

                <div className="pt-3 min-h-[250px] overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-zinc-250 bg-zinc-50 font-bold font-sans text-zinc-500 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Donor Partner Shop</th>
                        <th className="py-2.5 px-3">Installation Address Location</th>
                        <th className="py-2.5 px-3 text-right font-bold">Cleared Yield Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-750 font-medium">
                      {reportCollections.map((row) => (
                        <tr key={row.id}>
                          <td className="py-2.5 px-3 font-bold text-zinc-900">{row.donorName}</td>
                          <td className="py-2.5 px-3 italic font-sans text-[11px] text-zinc-550">{row.address}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-zinc-900 font-mono">${row.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      {reportCollections.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-450 italic">
                            No transactions registered under selected scope date.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t-2 border-zinc-250 flex flex-col items-end gap-1 text-xs">
                  <div className="w-full md:max-w-md space-y-1.5 font-sans leading-normal">
                    <div className="flex justify-between text-zinc-550">
                      <span>Gross Compiled Collections Total:</span>
                      <strong className="text-zinc-800 font-mono font-medium">${calculatedTotalAmount.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-550">
                      <span>Less: Operational Equipment / Box Expenses:</span>
                      <strong className="text-zinc-800 font-mono font-medium">-${currentExpenses.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between text-zinc-550">
                      <span>Less: Field Commission (15% Operators Allocation):</span>
                      <strong className="text-zinc-800 font-mono font-medium">-${calculatedCommission.toFixed(2)}</strong>
                    </div>
                    <div className="border-t border-dashed border-zinc-250 my-1 pt-1"></div>
                    <div className="flex justify-between items-center text-sm font-bold pt-0.5">
                      <span className="text-sky-850 uppercase tracking-wide font-sans font-bold">Grand Net NGO Amount:</span>
                      <strong className="text-sky-950 font-mono font-black text-base bg-sky-50 py-1 px-2.5 rounded-lg border border-sky-150">
                        ${calculatedGrandTotal.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] text-zinc-400 font-mono">
                  <div className="text-center w-full sm:w-auto">
                    <div className="border-t border-dashed border-zinc-300 w-44 mx-auto pb-1"></div>
                    <span>TRUSTEE OFFICER SIGNATURE</span>
                  </div>
                  <p className="text-center italic max-w-xs text-[9px] text-zinc-350 leading-relaxed font-sans">
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
      ) : (
        /* TAB 2: MERGED SEARCHABLE COLLECTION LEDGER */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Advanced Filters Panel */}
          <div className="bg-white p-5 rounded-xl border border-zinc-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 text-zinc-900">
              <SlidersHorizontal className="w-4.5 h-4.5 text-sky-600" />
              <span className="text-sm font-extrabold">Ledger Filtering Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-550 mb-1.5" htmlFor="crSearch">
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
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-550 mb-1.5" htmlFor="crCollector">
                  Field Collector Filter
                </label>
                <select
                  id="crCollector"
                  value={selectedCollectorId}
                  onChange={(e) => setSelectedCollectorId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs text-slate-750 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="All">All Dispatchers</option>
                  {collectors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-550 mb-1.5" htmlFor="crCity">
                  Location City
                </label>
                <select
                  id="crCity"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs text-slate-755 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="All">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-550 mb-1.5" htmlFor="crRange">
                  Reporting Timeline Cycle
                </label>
                <select
                  id="crRange"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-205 rounded-lg text-xs text-slate-755 font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="All">Entire Ledger History</option>
                  <option value="Today">Today ({sessionDate.dayName})</option>
                  <option value="Last7Days">Last 7 Days Yield</option>
                  <option value="Last30Days">Last 30 Days Yield</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4.5 border border-emerald-150 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-850 shadow-inner shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-emerald-950 font-black block text-sm">Filtered Scanning Ledger Aggregates</span>
                <p className="text-xs text-emerald-800/80 leading-normal font-medium">
                  Matches {ledgerCollections.length} digital telemetry scanning records from fields operations.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wide block font-mono">Ledger Sum</span>
              <span className="text-xl font-black font-sans text-emerald-950">${totalAmountLedger.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-105 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-6">Transaction Ref</th>
                    <th className="py-3.5 px-6">Collection Time</th>
                    <th className="py-3.5 px-6">Box donor Host Source</th>
                    <th className="py-3.5 px-6">Location Address Target</th>
                    <th className="py-3.5 px-6">Collected By (Staff)</th>
                    <th className="py-3.5 px-6 text-right font-bold">Cleared Yield Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {ledgerCollections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        <History className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                        <p className="font-semibold text-zinc-750">No transaction records match query.</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Widen the filters above to retrieve complete logs.</p>
                      </td>
                    </tr>
                  ) : (
                    ledgerCollections.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/40 transition-all font-medium text-zinc-700">
                        <td className="py-4 px-6 align-middle font-mono text-zinc-500 font-bold text-xs uppercase">
                          {item.id}
                        </td>
                        <td className="py-4 px-6 align-middle font-mono text-zinc-700 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{item.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <div>
                            <span className="font-bold text-zinc-850 block leading-tight">{item.donorName}</span>
                            <span className="text-[10px] font-mono font-bold text-sky-700">Box Ref: {item.boxId}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-middle text-zinc-500 text-xs font-normal">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-350 shrink-0" />
                            <span>{item.address}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-705 font-bold">
                            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{item.collectorName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-middle text-right font-mono font-black text-zinc-900">
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
      )}
    </div>
  );
};
export default ReportsModule;
