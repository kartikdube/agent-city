'use client';

import React from 'react';
import { Card, Badge } from './ui-elements';
import { ScenarioMetadata } from '../types/scenario';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, CircleDot, ChevronRight, Target } from 'lucide-react';

interface ScenarioCardProps {
  metadata: ScenarioMetadata;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ScenarioCard = ({ metadata, isSelected, onSelect }: ScenarioCardProps) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'people_pleasers': return <Users size={24} />;
      case 'fiscal_hawks': return <Shield size={24} />;
      case 'power_players': return <Zap size={24} />;
      case 'technocrats': return <CircleDot size={24} />;
      default: return <Target size={24} />;
    }
  };

  const getAccentColor = (id: string) => {
    switch (id) {
      case 'people_pleasers': return 'text-emerald-400 group-hover:bg-emerald-500';
      case 'fiscal_hawks': return 'text-amber-400 group-hover:bg-amber-500';
      case 'power_players': return 'text-purple-400 group-hover:bg-purple-500';
      case 'technocrats': return 'text-blue-400 group-hover:bg-blue-500';
      default: return 'text-slate-400 group-hover:bg-slate-500';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card 
        className={`h-full group cursor-default border-2 transition-all duration-500 flex flex-col ${
          isSelected ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800/50 hover:border-slate-700'
        }`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300 group-hover:text-white ${getAccentColor(metadata.id)}`}>
            {getIcon(metadata.id)}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
             {metadata.tags.map(tag => (
               <Badge key={tag} variant="info" className="text-[9px] px-2 py-0.5 bg-slate-800/80 border-slate-700/50">{tag}</Badge>
             ))}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{metadata.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{metadata.description}</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 space-y-1.5">
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                 <Zap size={10} className="text-blue-400" /> Behavior Summary
               </p>
               <p className="text-xs text-slate-300 italic">"{metadata.behavior_summary}"</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/50 space-y-1.5">
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
                 <Target size={10} className="text-emerald-400" /> Governance Style
               </p>
               <p className="text-xs text-slate-300 font-medium">→ {metadata.governance_style}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelect(metadata.id)}
          className={`mt-8 w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            isSelected 
              ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]'
          }`}
        >
          {isSelected ? 'Active Scenario' : 'Select Scenario'}
          {!isSelected && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </Card>
    </motion.div>
  );
};
