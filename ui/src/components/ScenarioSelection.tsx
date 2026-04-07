'use client';

import React from 'react';
import { ScenarioCard } from './ScenarioCard';
import { ScenarioMetadata } from '../types/scenario';

interface ScenarioSelectionProps {
  onSelect: (scenarioId: string) => void;
  selectedId: string | null;
}

const scenarios: ScenarioMetadata[] = [
  {
    id: 'people_pleasers',
    title: 'People Pleasers',
    description: 'Prioritize public approval, empathy, and short-term citizen satisfaction above fiscal restraint.',
    behavior_summary: 'All 3 decision makers care about short-term happiness and popular sentiment.',
    governance_style: 'Likely to approve popular but expensive policies.',
    tags: ['Social', 'Emotional', 'Easy']
  },
  {
    id: 'fiscal_hawks',
    title: 'Fiscal Hawks',
    description: 'Budget-conscious, skeptical of expensive projects, and cost-first efficiency experts.',
    behavior_summary: 'All 3 decision makers focus on financial tradeoffs and economic justification.',
    governance_style: 'Likely to reject proposals without strong economic justification.',
    tags: ['Economic', 'Strategic', 'Hard']
  },
  {
    id: 'power_players',
    title: 'Power Players',
    description: 'Political and strategic leaders who are protective of their influence and prestige.',
    behavior_summary: 'Decisions are shaped by internal politics, control, and optical leverage.',
    governance_style: 'Likely to approve projects that consolidate authority or prestige.',
    tags: ['Political', 'Control', 'Hard']
  },
  {
    id: 'technocrats',
    title: 'Technocrats',
    description: 'Evidence-driven, analytical, and process-oriented experts focused on pilot results.',
    behavior_summary: 'Analytical and evidence-based decision-making. Prefer data over emotion.',
    governance_style: 'Likely to approve projects with clear KPIs and pilot results.',
    tags: ['Data', 'Logical', 'Medium']
  }
];

export const ScenarioSelection = ({ onSelect, selectedId }: ScenarioSelectionProps) => {
  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-1000">
      <div className="max-w-3xl mx-auto text-center space-y-4 px-2">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white uppercase">Governor Scenario <span className="text-blue-500 font-black">Matrix</span></h2>
        <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
          The city state remains constant. The outcome of your policies depends entirely on the behavioral makeup of your Decision Makers.
        </p>
        <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {scenarios.map((s) => (
          <ScenarioCard 
            key={s.id} 
            metadata={s} 
            isSelected={selectedId === s.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="flex justify-center border-t border-slate-800/50 pt-8 md:pt-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center text-slate-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <div className="flex flex-col items-center gap-2">
             <div className="h-0.5 w-8 bg-blue-500 rounded-full mb-1" />
             <span className="text-[10px] uppercase font-bold tracking-widest">Procedural Simulation</span>
           </div>
           <div className="flex flex-col items-center gap-2">
             <div className="h-0.5 w-8 bg-emerald-500 rounded-full mb-1" />
             <span className="text-[10px] uppercase font-bold tracking-widest">Behavioral Modelling</span>
           </div>
           <div className="flex flex-col items-center gap-2">
             <div className="h-0.5 w-8 bg-amber-500 rounded-full mb-1" />
             <span className="text-[10px] uppercase font-bold tracking-widest">Static Portfolio Mode</span>
           </div>
        </div>
      </div>
    </div>
  );
};
