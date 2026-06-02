import React from 'react';

import { Camera, AlertTriangle, Receipt, PlusSquare } from 'lucide-react';

import { CollectionRecord, DonationBox, ExpenseRecord } from '../types';



interface CollectorDashboardProps {

  collectorName: string;

  collectorId: string;

  myAssignedBoxes: DonationBox[];

  pendingUncollectedBoxes: DonationBox[];

  myCollections: CollectionRecord[];

  totalMyCollectionsSum: number;

  totalMyExpensesSum: number;

  myExpenses: ExpenseRecord[];

  onScan: (box?: DonationBox) => void;

  onIssue: () => void;

  onDemand: () => void;

  onExpense: () => void;

  onHistory: () => void;

}



const CollectorDashboard: React.FC<CollectorDashboardProps> = ({

  collectorName,

  collectorId,

  myAssignedBoxes,

  pendingUncollectedBoxes,

  myCollections,

  totalMyCollectionsSum,

  totalMyExpensesSum,

  myExpenses,

  onScan,

  onIssue,

  onDemand,

  onExpense,

  onHistory,

}) => {

  return (

    <div className="space-y-6 w-full max-w-none">

      <div className="bg-gradient-to-r from-sky-50 via-sky-50/50 to-cyan-50/40 dark:from-sky-950/30 dark:via-sky-950/15 dark:to-cyan-950/20 border border-sky-100 dark:border-sky-900/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">

        <span className="font-mono text-sky-900 dark:text-sky-200 font-bold">

          Active Collector: <strong className="text-sky-950 dark:text-white font-black">{collectorName}</strong> ({collectorId})

        </span>

        <span className="text-[11px] text-sky-800/70 dark:text-sky-400/90 font-mono bg-white/60 dark:bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900/50">

          Assigned: {myAssignedBoxes.length}

        </span>

      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button
          type="button"
          onClick={() => onScan()}
          className="bg-gradient-to-br from-sky-50 to-cyan-50/80 dark:from-sky-950/40 dark:to-cyan-950/20 p-5 rounded-2xl border border-sky-100 dark:border-sky-800/60 hover:border-sky-300 hover:shadow-md text-left transition flex flex-col gap-3 group w-full"
        >
          <div className="w-11 h-11 rounded-xl bg-white/90 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shadow-sm ring-1 ring-sky-100 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-sky-950 dark:text-white">Collect Now</p>
            <p className="text-[11px] text-sky-800/70 dark:text-sky-400/80 mt-0.5">
              Start scan for {pendingUncollectedBoxes.length} pending box(es)
            </p>
          </div>
        </button>

        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-teal-50/50 dark:from-emerald-950/30 dark:via-black dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm w-full">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">Total Collected</p>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">${totalMyCollectionsSum.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/80 mt-0.5">Your cleared amount this cycle</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/40 dark:from-amber-950/25 dark:via-black dark:to-orange-950/15 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40 shadow-sm w-full">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700/80 dark:text-amber-400/80">Pending Boxes</p>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{pendingUncollectedBoxes.length}</p>
        </div>

        <button
          type="button"
          onClick={onHistory}
          className="bg-gradient-to-br from-sky-50 via-sky-50/30 to-indigo-50/40 dark:from-sky-950/25 dark:via-black dark:to-indigo-950/20 p-5 rounded-2xl border border-sky-100 dark:border-sky-900/40 shadow-sm w-full text-left hover:border-sky-300 hover:shadow-md transition"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700/80 dark:text-sky-400/80">Collection Records</p>
          <p className="text-2xl font-black text-sky-900 dark:text-sky-200 mt-1">{myCollections.length}</p>
        </button>

        <button
          type="button"
          onClick={onExpense}
          className="bg-gradient-to-br from-rose-50 to-pink-50/40 dark:from-rose-950/30 dark:to-pink-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 hover:border-rose-300 hover:shadow-md text-left transition w-full"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700/80 dark:text-rose-400/80">Expense Claims</p>
          <p className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">${totalMyExpensesSum.toFixed(2)}</p>
        </button>

        <button
          type="button"
          onClick={onIssue}
          className="bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/35 dark:to-orange-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40 hover:border-amber-300 hover:shadow-md text-left transition w-full"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700/80 dark:text-amber-400/80">Report Issue</p>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mt-1">Damaged or stuck locks</p>
        </button>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">

        <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/30 dark:from-amber-950/15 dark:via-black dark:to-orange-950/10 border border-amber-100/80 dark:border-amber-900/30 rounded-2xl p-5 shadow-sm w-full">

          <h3 className="text-sm font-black text-amber-950 dark:text-white mb-4">Pending Assigned Boxes</h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">

            {pendingUncollectedBoxes.map((box) => (

              <div

                key={box.id}

                className="p-3 rounded-xl bg-white/80 dark:bg-amber-950/20 border border-amber-100/90 dark:border-amber-900/40 shadow-xs"

              >

                <p className="font-bold text-slate-900 dark:text-white">{box.donorName}</p>

                <p className="text-[11px] text-amber-900/60 dark:text-amber-400/70 mt-1">{box.address}, {box.city}</p>

                <button

                  type="button"

                  onClick={() => onScan(box)}

                  className="mt-2 text-[11px] py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"

                >

                  Collect

                </button>

              </div>

            ))}

            {pendingUncollectedBoxes.length === 0 && (

              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/80 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">

                All assigned boxes are collected.

              </p>

            )}

          </div>

        </div>



        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-emerald-950/15 dark:via-black dark:to-teal-950/10 border border-emerald-100/80 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm w-full">

          <div className="flex items-center justify-between mb-4">

            <h3 className="text-sm font-black text-emerald-950 dark:text-white">Recent Collections</h3>

            <button type="button" onClick={onHistory} className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline">

              View all

            </button>

          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">

            {myCollections.slice(0, 6).map((rec) => (

              <div

                key={rec.id}

                className="p-3 rounded-xl bg-white/80 dark:bg-emerald-950/20 border border-emerald-100/90 dark:border-emerald-900/40 flex items-center justify-between shadow-xs"

              >

                <div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white">{rec.donorName}</p>

                  <p className="text-[11px] text-emerald-800/60 dark:text-emerald-500/70">{rec.date}</p>

                </div>

                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">${rec.amount.toFixed(2)}</p>

              </div>

            ))}

            {myCollections.length === 0 && (

              <p className="text-sm text-zinc-500 bg-white/60 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">

                No collections recorded yet.

              </p>

            )}

          </div>

        </div>

      </div>



      <div className="bg-gradient-to-br from-violet-50/60 via-white to-indigo-50/40 dark:from-violet-950/15 dark:via-black dark:to-indigo-950/15 border border-violet-100/80 dark:border-violet-900/30 rounded-xl p-5 shadow-sm w-full">

        <h3 className="text-xs font-black text-violet-900 dark:text-white uppercase tracking-wider font-mono mb-3">

          Recent Expense Claims

        </h3>

        <div className="space-y-2.5">

          {myExpenses.slice(0, 3).map((item) => (

            <div

              key={item.id}

              className="p-3 bg-white/85 dark:bg-violet-950/25 border border-violet-100/90 dark:border-violet-900/40 rounded-xl flex items-center justify-between text-xs shadow-xs"

            >

              <div>

                <strong className="text-violet-950 dark:text-white font-black">{item.category}</strong>

                <span className="text-[11px] text-violet-800/60 dark:text-violet-400/70 block mt-1">{item.description}</span>

              </div>

              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">${item.amount.toFixed(2)}</span>

            </div>

          ))}

          {myExpenses.length === 0 && (

            <div className="text-center py-4 text-violet-600/70 dark:text-violet-400/60 italic text-xs bg-white/50 dark:bg-violet-950/20 rounded-xl border border-violet-100/60 dark:border-violet-900/30">

              No expense claims yet.

            </div>

          )}

        </div>

      </div>

    </div>

  );

};



export default CollectorDashboard;

