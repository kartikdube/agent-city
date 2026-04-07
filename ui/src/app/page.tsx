'use client';

import React, { useState, useEffect } from 'react';
import { ScenarioSelection } from '../components/ScenarioSelection';
import { Dashboard } from '../components/Dashboard';
import { HierarchyViewer } from '../components/HierarchyViewer';
import { PolicyWorkbench } from '../components/PolicyWorkbench';
import { DecisionPipeline } from '../components/DecisionPipeline';
import { ScenarioData } from '../types/scenario';
import { LayoutGrid, Users, Terminal, MessageSquare, Cog, Globe, Activity, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui-elements';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'setup' | 'conversations'>('scenarios');
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'hierarchy' | 'policy'>('dashboard');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScenarioSelect = async (id: string) => {
    setLoading(true);
    try {
      // Simulate network delay for portfolio feel
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await fetch(`./scenarios/${id}.json`);
      const data = await response.json();
      setScenarioData(data);
      setSelectedScenarioId(id);
      setActiveTab('setup');
    } catch (error) {
      console.error("Failed to load scenario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background text-slate-200 selection:bg-blue-500/30 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <header className="flex-shrink-0 sticky top-0 z-50 glass border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('scenarios')}>
             <div className="h-11 w-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-500">
               <Globe size={26} />
             </div>
             <div>
               <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-tight">AGENTCITY <span className="text-blue-500">LABS</span></h1>
               <div className="flex items-center gap-1.5 opacity-60">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-blue-400/80">multi agent city</span>
               </div>
             </div>
          </div>

          <nav className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
             <TabButton 
               active={activeTab === 'scenarios'} 
               onClick={() => setActiveTab('scenarios')}
               icon={<BookOpen size={18} />}
               label="Scenario Selection"
             />
             <TabButton 
               active={activeTab === 'setup'} 
               onClick={() => setActiveTab('setup')}
               disabled={!selectedScenarioId || loading}
               icon={loading && activeTab === 'scenarios' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Cog size={18} /></motion.div> : <Cog size={18} />}
               label="Simulation Setup"
             />
             <TabButton 
               active={activeTab === 'conversations'} 
               onClick={() => setActiveTab('conversations')}
               disabled={!selectedScenarioId}
               icon={<MessageSquare size={18} />}
               label="Simulation"
             />
          </nav>

          <div className="hidden lg:flex items-center gap-6">
             {selectedScenarioId && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-right"
               >
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Active Governance</p>
                 <p className="text-sm font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">{scenarioData?.metadata?.title}</p>
               </motion.div>
             )}
             <div className="h-10 w-[1px] bg-white/5" />
             <div className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
               <Activity size={22} />
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] mx-auto px-6 mt-8 w-full overflow-hidden flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden pr-2">
        <AnimatePresence mode="wait">
          {activeTab === 'scenarios' ? (
            <motion.div
              key="scenarios-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="flex-1 overflow-y-auto custom-scrollbar"
            >
              <ScenarioSelection onSelect={handleScenarioSelect} selectedId={selectedScenarioId} />
            </motion.div>
          ) : activeTab === 'setup' ? (
            <motion.div
              key="setup-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col space-y-8 overflow-hidden"
            >

              {/* Sub-tabs for Setup */}
              <div className="flex-shrink-0 flex items-center gap-10 border-b border-white/5 pb-1">
                <SubTabButton 
                  active={activeSubTab === 'dashboard'} 
                  onClick={() => setActiveSubTab('dashboard')}
                  icon={<LayoutGrid size={18} />}
                  label="City Dashboard"
                />
                <SubTabButton 
                  active={activeSubTab === 'hierarchy'} 
                  onClick={() => setActiveSubTab('hierarchy')}
                  icon={<Users size={18} />}
                  label="Agent Hierarchy"
                />
                <SubTabButton 
                  active={activeSubTab === 'policy'} 
                  onClick={() => setActiveSubTab('policy')}
                  icon={<Terminal size={18} />}
                  label="Policy Workbench"
                />
              </div>

              {/* View Components */}
              <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
                {activeSubTab === 'dashboard' && <Dashboard city={scenarioData?.initial_city_state} />}
                {activeSubTab === 'hierarchy' && <HierarchyViewer government={scenarioData?.government_structure} />}
                {activeSubTab === 'policy' && <PolicyWorkbench city={scenarioData?.initial_city_state} />}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="conversations-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <DecisionPipeline scenarioData={scenarioData as any} />
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg' 
        : disabled 
          ? 'opacity-30 cursor-not-allowed text-slate-500'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

const SubTabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 pb-4 text-sm font-medium transition-all relative ${
      active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    {label}
    {active && (
      <motion.div 
        layoutId="underline" 
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]" 
      />
    )}
  </button>
);


