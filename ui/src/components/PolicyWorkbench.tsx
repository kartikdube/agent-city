'use client';

import React from 'react';
import { Card, Badge } from './ui-elements';
import { Target, Briefcase, TrendingDown, Clock, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';

const SHARED_POLICY = {
  title: "Integrated Mobility and Affordability Plan",
  summary: "Reduce downtown traffic congestion, improve housing access, and protect city budget.",
  objectives: [
    "Cut congestion by 20%",
    "Increase housing affordability near transit",
    "Maintain budget surplus ($30M target)"
  ],
  package: [
    { id: 'tu', title: 'Transit Upgrade', desc: 'Modernize bus corridors & express shuttles.' },
    { id: 'pr', title: 'Parking Reform', desc: 'Peak hour pricing & bus priority lanes.' },
    { id: 'hi', title: 'Housing Incentive', desc: 'Mixed-use zoning near transit nodes.' },
    { id: 'im', title: 'Industrial Mitigation', desc: 'Emissions-control & green buffers.' }
  ],
  tradeoffs: [
    "Capital spending vs. Surplus protection",
    "Parking reform vs. Business opposition",
    "Industrial control vs. Employer resistance"
  ],
  timeline: [
    { phase: "0–3m", action: "Public Communication" },
    { phase: "3–9m", action: "Lane Conversions" },
    { phase: "9–18m", action: "Final Upgrades" }
  ],
  budget: "22,000,000",
  horizon: "18 Months"
};

interface PolicyWorkbenchProps {
  city: any;
}

export const PolicyWorkbench = ({ city }: PolicyWorkbenchProps) => {
  if (!city) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Column 1: Policy Definition */}
      <div className="space-y-6">
        <Card className="border-blue-500/20 bg-blue-500/[0.02] h-full flex flex-col">
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <Badge variant="info" className="mb-2">Active Strategic Draft</Badge>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">{SHARED_POLICY.title}</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{SHARED_POLICY.summary}</p>
            </div>
            <div className="flex-shrink-0 p-3 rounded-2xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
               <ShieldCheck size={28} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
             <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-inner">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-1.5 flex items-center gap-2">
                  <TrendingDown size={12} className="text-emerald-500" /> Allocated Budget
                </p>
                <p className="text-lg md:text-xl font-mono font-black text-white">${SHARED_POLICY.budget}</p>
             </div>
             <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 shadow-inner">
                <p className="text-[10px] uppercase font-black text-slate-500 mb-1.5 flex items-center gap-2">
                  <Clock size={12} className="text-amber-500" /> Plan Horizon
                </p>
                <p className="text-lg md:text-xl font-mono font-black text-white">{SHARED_POLICY.horizon}</p>
             </div>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <h4 className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-[0.2em] flex items-center gap-2">
                <Target size={12} className="text-blue-500" /> Strategic Objectives
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {SHARED_POLICY.objectives.map(obj => (
                  <div key={obj} className="px-4 py-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {obj}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-[0.2em] flex items-center gap-2">
                <Briefcase size={12} className="text-blue-500" /> Core Measures
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {SHARED_POLICY.package.map(pkg => (
                  <div key={pkg.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/40 hover:border-blue-500/30 transition-all group shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{pkg.title}</span>
                      <span className="text-[9px] text-slate-600 font-black tracking-widest bg-slate-900 px-2 py-0.5 rounded uppercase">ID: {pkg.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{pkg.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Column 2: Implementation & Risk */}
      <div className="space-y-6">
        <Card className="border-slate-800/50 bg-slate-900/10">
          <h4 className="text-[10px] uppercase font-black text-slate-400 mb-6 tracking-[0.2em] flex items-center gap-2">
            <Calendar size={12} className="text-amber-500" /> Implementation Timeline
          </h4>
          <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gradient-to-b before:from-amber-500/50 before:via-slate-800 before:to-transparent">
             {SHARED_POLICY.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                   <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-slate-950 border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                   <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{item.phase}</p>
                   <p className="text-sm font-bold text-white">{item.action}</p>
                </div>
             ))}
          </div>
        </Card>

        <Card className="border-red-500/10 bg-red-500/[0.01]">
          <h4 className="text-[10px] uppercase font-black text-slate-400 mb-5 tracking-[0.2em] flex items-center gap-2">
            <AlertCircle size={12} className="text-red-500" /> Critical Tradeoffs
          </h4>
          <div className="space-y-3">
             {SHARED_POLICY.tradeoffs.map((t, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
                   <div className="mt-1 h-1 w-3 bg-red-500/40 rounded-full" />
                   <p className="text-[11px] text-slate-400 leading-snug">{t}</p>
                </div>
             ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Policy Status</p>
                   <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Under Final Review</p>
                </div>
             </div>
          </div>
        </Card>

        <div className="p-6 rounded-3xl bg-slate-900/20 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500/40">
             <Target size={24} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Portfolio Mode</p>
             <p className="text-xs text-slate-500 leading-relaxed font-medium">
               Static strategic overview. All simulation actions are locked in this project version.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};
