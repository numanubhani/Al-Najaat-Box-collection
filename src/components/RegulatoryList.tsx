/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNGOStore } from '../store';
import { IssueReport, BoxDemand } from '../types';
import {
  AlertTriangle,
  FolderDot,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Phone,
  User,
  PlusSquare,
  AlertCircle,
  TrendingUp,
  Sliders,
  Check,
  X
} from 'lucide-react';

export const RegulatoryList: React.FC = () => {
  const {
    issueReports,
    updateIssueStatus,
    boxDemands,
    updateDemandStatus,
    collectors
  } = useNGOStore();

  const [activeTab, setActiveTab] = useState<'issues' | 'demands'>('issues');

  // Counts
  const pendingIssuesCount = issueReports.filter((i) => i.status === 'Pending').length;
  const pendingDemandsCount = boxDemands.filter((d) => d.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Compliance & Demands Tracker</h1>
          <p className="text-sm text-zinc-500">
            Track box damage/missing reports and evaluate collector-submitted proposals for new donation placements.
          </p>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-150/80 rounded-xl border border-zinc-200/55 max-w-md">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'issues'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-100'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Field Issue Reports ({pendingIssuesCount} Pending)
        </button>
        <button
          onClick={() => setActiveTab('demands')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'demands'
              ? 'bg-white text-zinc-900 shadow-sm border border-zinc-100'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <PlusSquare className="w-4 h-4 text-emerald-600" />
          Box Placements Approve ({pendingDemandsCount} Pending)
        </button>
      </div>

      {/* Issues list tab implementation */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-4.5 text-xs text-amber-900 leading-normal">
            <span className="font-bold flex items-center gap-1 mb-0.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Field Incidents Dispatcher Protocol:
            </span>
            Once an issue listed as "Damaged Box" or "Missing Box" is resolved, pressing "Mark Resolved" 
            automatically restores the corresponding donation box back to <strong>Active</strong> in the central registrar.
          </div>

          <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-5">Incident ID</th>
                    <th className="py-3 px-5">Box ID</th>
                    <th className="py-3 px-5">Issue Type</th>
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5">Filed By (Date)</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right font-mono">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {issueReports.map((issue) => (
                    <tr key={issue.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4.5 px-5 align-middle font-mono font-bold text-zinc-500">
                        {issue.id}
                      </td>
                      <td className="py-4.5 px-5 align-middle font-mono font-bold text-zinc-900">
                        {issue.boxId}
                      </td>
                      <td className="py-4.5 px-5 align-middle">
                        <span className="py-1 px-2.5 rounded text-xs font-semibold bg-rose-50 border border-rose-100 text-rose-800">
                          {issue.issueType}
                        </span>
                      </td>
                      <td className="py-4.5 px-5 align-middle text-zinc-600 max-w-xs break-words text-xs leading-normal">
                        {issue.description}
                      </td>
                      <td className="py-4.5 px-5 align-middle">
                        <span className="text-zinc-800 block text-xs font-medium">{issue.collectorName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {issue.date}
                        </span>
                      </td>
                      <td className="py-4.5 px-5 align-middle text-center">
                        <span
                          className={`inline-block py-0.5 px-2 rounded-full text-xs font-semibold ${
                            issue.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-150'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-5 align-middle text-right">
                        {issue.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              if (confirm(`Mark incident report ${issue.id} on Box ${issue.boxId} as Resolved?`)) {
                                updateIssueStatus(issue.id, 'Resolved');
                              }
                            }}
                            className="inline-flex items-center justify-center gap-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shadow-sm cursor-pointer transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        ) : (
                          <span className="text-zinc-400 text-xs flex items-center gap-1 justify-end">
                            <Check className="w-4 h-4 text-emerald-500" /> Fixed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {issueReports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <FolderDot className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                        <p className="font-semibold">No operational issues recorded.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Demands list tab implementation */}
      {activeTab === 'demands' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4.5 text-xs text-emerald-900 leading-normal">
            <span className="font-bold flex items-center gap-1 mb-0.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Autonomous Box Provisioning:
            </span>
            Approving a location proposal immediately registers a new operational Donation Box with an auto-generated 
            tracking ID inside our database! This allows collectors to scan the physical placement instantly.
          </div>

          <div className="bg-white rounded-xl border border-zinc-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-5">Demand ID</th>
                    <th className="py-3 px-5">Suggested Placement Shop</th>
                    <th className="py-3 px-5">Target Address Location</th>
                    <th className="py-3 px-5">Retail Contact</th>
                    <th className="py-3 px-5 text-center">Estimated Traffic</th>
                    <th className="py-3 px-5 text-center">Approve Status</th>
                    <th className="py-3 px-5 text-right font-mono">Acknowledge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {boxDemands.map((demand) => (
                    <tr key={demand.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4.5 px-5 align-middle font-mono font-bold text-zinc-500">
                        {demand.id}
                      </td>
                      <td className="py-4.5 px-5 align-middle font-bold text-zinc-900">
                        {demand.suggestedLocation}
                      </td>
                      <td className="py-4.5 px-5 align-middle text-zinc-650 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                          <span>{demand.address}, <strong>{demand.city}</strong></span>
                        </div>
                        {demand.notes && (
                          <div className="text-[10px] text-zinc-400 italic max-w-xs mt-1">
                            Notes: "{demand.notes}"
                          </div>
                        )}
                      </td>
                      <td className="py-4.5 px-5 align-middle text-xs text-zinc-600">
                        <span className="block font-medium text-zinc-800">{demand.contactPerson}</span>
                        <span className="text-[11px] font-mono block text-zinc-400 mt-0.5">{demand.contactNumber}</span>
                      </td>
                      <td className="py-4.5 px-5 align-middle text-center font-mono text-zinc-700 text-xs">
                        {demand.estimatedTraffic}
                      </td>
                      <td className="py-4.5 px-5 align-middle text-center">
                        <span
                          className={`inline-block py-0.5 px-2 rounded-full text-xs font-semibold ${
                            demand.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-150'
                              : demand.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : 'bg-rose-50 text-rose-850 border border-rose-100'
                          }`}
                        >
                          {demand.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-5 align-middle text-right">
                        {demand.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                if (confirm(`Approve box installation demand at "${demand.suggestedLocation}"?`)) {
                                  updateDemandStatus(demand.id, 'Approved');
                                }
                              }}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Reject placement demand at "${demand.suggestedLocation}"?`)) {
                                  updateDemandStatus(demand.id, 'Rejected');
                                }
                              }}
                              className="p-1 px-2 text-zinc-650 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded text-xs font-medium cursor-pointer transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : demand.status === 'Approved' ? (
                          <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end gap-1">
                            <Check className="w-4 h-4" /> Provisioned
                          </span>
                        ) : (
                          <span className="text-rose-500 text-xs font-semibold flex items-center justify-end gap-1">
                            <X className="w-4 h-4" /> Declined
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {boxDemands.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <FolderDot className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                        <p className="font-semibold">No location placement demands recorded.</p>
                      </td>
                    </tr>
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
export default RegulatoryList;
