'use client';

import React, { useState } from 'react';
import { Card, Badge } from './ui-elements';
import { User, Zap, Brain, Search, Crown, Building2, TrendingUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENT_REGISTRY } from '../lib/agent-names';
import { X } from 'lucide-react';

interface HierarchyViewerProps {
  government: any;
}

const BODY_CONFIG: Record<string, { icon: React.ReactNode; color: string; accent: string }> = {
  'Infrastructure':       { icon: <Building2 size={12} />, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',   accent: 'bg-blue-500' },
  'Economic Development': { icon: <TrendingUp size={12} />, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', accent: 'bg-emerald-500' },
  'Public Safety':        { icon: <Shield size={12} />, color: 'bg-violet-500/10 border-violet-500/20 text-violet-400', accent: 'bg-violet-500' },
};

export const HierarchyViewer = ({ government }: HierarchyViewerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1280); // xl breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!government) return null;

  const agents = government.agents || {};
  const president = agents['PRESIDENT'];
  const bodies = government.bodies || [];
  const selectedAgent = selectedId ? agents[selectedId] : null;

  const getBodyAgents = (bodyName: string) =>
    Object.values(agents).filter((a: any) => a.body === bodyName);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 md:gap-8">
      {/* Tree */}
      <div className="xl:col-span-3 space-y-6 md:space-y-10">
        {/* President */}
        <div className="flex justify-center">
          {president && (
            <PresidentNode
              agent={president}
              isSelected={selectedId === 'PRESIDENT'}
              onClick={() => setSelectedId(selectedId === 'PRESIDENT' ? null : 'PRESIDENT')}
            />
          )}
        </div>

        {/* Connector line */}
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gradient-to-b from-amber-500/40 to-slate-800" />
        </div>

        {/* Bodies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {bodies.map((body: string, bodyIdx: number) => {
            const bodyAgents = getBodyAgents(body);
            const dm = bodyAgents.find((a: any) => a.role?.includes('Decision Maker'));
            const analysts = bodyAgents.filter((a: any) => a.role?.includes('Analyst'));
            const cfg = BODY_CONFIG[body] ?? BODY_CONFIG['Infrastructure'];

            return (
              <motion.div
                key={body}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bodyIdx * 0.1 }}
                className={`rounded-2xl border p-4 space-y-4 ${cfg.color}`}
              >
                {/* Body header */}
                <div className="flex items-center gap-2 mb-2">
                  {cfg.icon}
                  <span className="text-xs font-black uppercase tracking-widest">{body}</span>
                </div>

                {/* Decision Maker */}
                {(dm as any) && (
                  <DMNode
                    agent={dm as any}
                    isSelected={selectedId === (dm as any).id}
                    onClick={() => setSelectedId(selectedId === (dm as any).id ? null : (dm as any).id)}
                    accentClass={cfg.accent}
                  />
                )}

                {/* Divider */}
                <div className="border-t border-white/5 pt-3">
                  <p className="text-[9px] font-black text-current opacity-40 uppercase tracking-widest mb-3">Analysts</p>
                  <div className="grid grid-cols-1 gap-2">
                    {analysts.map((analyst: any) => (
                      <AnalystNode
                        key={analyst.id}
                        agent={analyst}
                        isSelected={selectedId === analyst.id}
                        onClick={() => setSelectedId(selectedId === analyst.id ? null : analyst.id)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel - Desktop */}
      {!isMobile && (
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="xl:sticky xl:top-8"
              >
                <AgentDetailPanel agent={selectedAgent} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-slate-600"
              >
                <div className="text-center">
                  <Search className="mx-auto mb-4 opacity-20" size={40} />
                  <p className="text-sm font-medium">Select an agent to view their cognitive profile</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile Modal */}
      <AnimatePresence>
        {isMobile && selectedAgent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 z-[70] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto pointer-events-auto shadow-2xl relative">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
                <div className="p-1">
                   <AgentDetailPanel agent={selectedAgent} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── President Node ───────────────────────────────────────────────────────────
const PresidentNode = ({ agent, isSelected, onClick }: any) => {
  const identity = AGENT_REGISTRY[agent.id];
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex items-center gap-3 md:gap-4 px-4 md:px-8 py-3 md:py-4 rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          : 'bg-slate-800/40 border-amber-500/30 hover:border-amber-500/60'
      }`}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-black font-black rounded-full text-[9px] uppercase tracking-widest">
        Commander in Chief
      </div>
      <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm md:text-lg border border-amber-500/30">
        {identity?.initial ?? 'EV'}
      </div>
      <div className="text-left">
        <p className="text-sm md:text-base font-black text-white">{identity?.name ?? agent.id}</p>
        <p className="text-[10px] md:text-xs text-amber-400 font-bold">{identity?.title ?? agent.role}</p>
        <p className="text-[10px] text-slate-600 font-mono mt-0.5">{agent.id}</p>
      </div>
      <Crown size={20} className="text-amber-500/40 ml-4" />
    </motion.button>
  );
};

// ─── Decision Maker Node ──────────────────────────────────────────────────────
const DMNode = ({ agent, isSelected, onClick, accentClass }: any) => {
  const identity = AGENT_REGISTRY[agent.id];
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
        isSelected
          ? 'bg-white/5 border-white/20 shadow-lg'
          : 'bg-slate-800/40 border-white/5 hover:border-white/15'
      }`}
    >
      <div className={`h-10 w-10 rounded-xl ${accentClass} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
        {identity?.initial ?? '??'}
      </div>
      <div className="text-left overflow-hidden">
        <p className="text-sm font-bold text-white truncate">{identity?.name ?? agent.id}</p>
        <p className="text-[10px] text-slate-400 truncate">{identity?.title ?? agent.role}</p>
        <p className="text-[9px] text-slate-700 font-mono">{agent.id}</p>
      </div>
    </motion.button>
  );
};

// ─── Analyst Node ─────────────────────────────────────────────────────────────
const AnalystNode = ({ agent, isSelected, onClick }: any) => {
  const identity = AGENT_REGISTRY[agent.id];
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-300 ${
        isSelected
          ? 'bg-white/5 border-white/15'
          : 'bg-slate-800/30 border-white/5 hover:border-white/10'
      }`}
    >
      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-black flex-shrink-0">
        {identity?.initial ?? '??'}
      </div>
      <div className="text-left overflow-hidden flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-200 truncate">{identity?.name ?? agent.id}</p>
        <p className="text-[9px] text-slate-500 truncate">{identity?.title ?? 'Analyst'}</p>
      </div>
      <p className="text-[8px] text-slate-700 font-mono flex-shrink-0">{agent.id}</p>
    </motion.button>
  );
};

// ─── Agent Detail Panel ───────────────────────────────────────────────────────
const AgentDetailPanel = ({ agent }: { agent: any }) => {
  const identity = AGENT_REGISTRY[agent.id];
  const isPresident = agent.id === 'PRESIDENT';
  const isDM = agent.role?.includes('Decision Maker');

  return (
    <Card className={`border-white/10 ${isPresident ? 'bg-amber-500/[0.03] border-amber-500/20' : ''}`}>
      {/* Avatar */}
      <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-white/5">
        <div className={`h-20 w-20 rounded-2xl mb-3 flex items-center justify-center font-black text-2xl border ${
          isPresident ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
          isDM        ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                        'bg-slate-700/50 text-slate-300 border-slate-600'
        }`}>
          {identity?.initial ?? '??'}
        </div>
        <h4 className="text-base font-black text-white">{identity?.name ?? agent.id}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{identity?.title ?? agent.role}</p>
        <p className="text-[10px] text-slate-600 font-mono mt-1">{agent.id}</p>
        {isPresident && <Badge variant="warning" className="mt-2">Commander in Chief</Badge>}
        {isDM && <Badge variant="info" className="mt-2">Department Head</Badge>}
      </div>

      {/* Traits */}
      <div>
        <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-4 flex items-center gap-2">
          <Zap size={11} /> Personality Profile
        </h5>
        <div className="space-y-3">
          {Object.entries(agent.traits || {}).map(([trait, val]: [string, any]) => {
            const pct = Math.round((val as number) * 100);
            return (
              <div key={trait} className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="capitalize font-medium">{trait.replace(/_/g, ' ')}</span>
                  <span className="font-mono font-bold">{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      pct >= 70 ? 'bg-emerald-500' :
                      pct >= 40 ? 'bg-blue-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {agent.memory && agent.memory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/5">
          <h5 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-3 flex items-center gap-2">
            <Brain size={11} /> Active Memory
          </h5>
          <div className="space-y-2">
            {agent.memory.map((m: string, i: number) => (
              <div key={i} className="text-[10px] p-2 rounded-lg bg-slate-800/60 text-slate-300 italic border-l-2 border-blue-500/40">
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
