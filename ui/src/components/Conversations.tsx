'use client';

import React from 'react';
import { Card, CardTitle } from './ui-elements';
import { MessageSquare, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const Conversations = () => {
  return (
    <div className="space-y-8 h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        {/* Sidebar: Active Channels */}
        <div className="md:col-span-1 border-r border-slate-800/50 pr-6 overflow-y-auto space-y-2">
           <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-4 px-2 tracking-widest flex items-center gap-2">
             <ShieldAlert size={12} /> Active Simulation
           </h4>
           {['Central Committee', 'Infrastructure Body', 'Economic Body', 'Public Safety'].map((ch, i) => (
             <button 
               key={ch}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                 i === 0 
                   ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 font-semibold' 
                   : 'border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
               }`}
             >
               {ch}
             </button>
           ))}
        </div>

        {/* Console: Log Messages */}
        <div className="md:col-span-3 flex flex-col justify-center items-center text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/5 transition-all group hover:border-slate-700">
           <div className="p-6 rounded-full bg-slate-800/20 text-slate-600 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Cpu size={64} />
           </div>
           <h3 className="text-xl font-bold text-slate-300 mb-2 font-mono">STANDBY MODE</h3>
           <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
             Simulation engine is idle. Input a policy in the Setup tab to generate a context prompt, or upload a JSON log to replay a session.
           </p>
           <div className="flex gap-4">
             <button className="px-6 py-2 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-600/20 transition-all text-sm uppercase tracking-tighter">
               Start Engine
             </button>
             <button className="px-6 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:bg-slate-700 transition-all text-sm uppercase tracking-tighter">
               Uplink Data
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
