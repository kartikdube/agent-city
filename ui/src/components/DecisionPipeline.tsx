'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './ui-elements';
import {
  MessageSquare, Users, TrendingUp,
  ArrowDown, Play, Loader2, Sparkles, CheckCircle2, XCircle, ThumbsUp, Save
} from 'lucide-react';
import { ScenarioData, PipelineBox, PipelineMessage } from '../types/scenario';
import { SYSTEM_PROMPTS, parseOllamaResponse, ParsedBoxResult } from '../lib/prompts';
import { AGENT_REGISTRY } from '../lib/agent-names';

interface DecisionPipelineProps {
  scenarioData?: ScenarioData;
}

const POLICY = {
  title: 'Integrated Mobility and Affordability Plan',
  summary: 'Reduce downtown traffic congestion by 20%, improve housing access near transit, and protect the $30M budget surplus.',
};

type BoxState = 'idle' | 'streaming' | 'done';

interface LiveBox {
  title: string;
  state: BoxState;
  streamText: string;
  result?: ParsedBoxResult;
}

const make_idle = (): LiveBox[] => [
  { title: 'Infrastructure Team',  state: 'idle', streamText: '' },
  { title: 'Economic Dev. Team',   state: 'idle', streamText: '' },
  { title: 'Public Safety Team',   state: 'idle', streamText: '' },
  { title: 'Sector Heads',         state: 'idle', streamText: '' },
  { title: 'Presidential Review',  state: 'idle', streamText: '' },
];

async function runStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  model = 'gpt-oss:20b'
): Promise<string> {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }
  return full;
}

export const DecisionPipeline = ({ scenarioData }: DecisionPipelineProps) => {
  const [boxes, setBoxes] = useState<LiveBox[]>(make_idle());
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  // Load existing simulation if available
  useEffect(() => {
    if (scenarioData?.simulation_log?.boxes) {
      const liveBoxes: LiveBox[] = scenarioData.simulation_log.boxes.map(box => ({
        title: box.title,
        state: 'done',
        streamText: '',
        result: {
          transcript: box.transcript,
          voteFor: box.status === 'approved' ? 5 : box.status === 'rejected' ? 0 : 3, // Mock vote based on status
          voteTotal: (box.id === 'heads') ? 3 : (box.id === 'pres_decision') ? 0 : 5,
          recommendation: box.recommendation,
          summary: box.summary,
          stats: box.stats // This needs to be in the interface
        }
      }));
      setBoxes(liveBoxes);
    } else {
      setBoxes(make_idle());
    }
  }, [scenarioData]);

  const setBoxState = (idx: number, patch: Partial<LiveBox>) =>
    setBoxes(prev => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  const appendChunk = (idx: number, chunk: string) =>
    setBoxes(prev => prev.map((b, i) => (i === idx ? { ...b, streamText: b.streamText + chunk } : b)));

  const runStep = async (
    idx: number,
    prompt: string,
    isPresident = false
  ): Promise<ParsedBoxResult> => {
    setCurrentStep(idx);
    setBoxState(idx, { state: 'streaming', streamText: '' });

    try {
      const full = await runStream(prompt, chunk => appendChunk(idx, chunk));
      const parsed = parseOllamaResponse(full, isPresident);
      setBoxState(idx, { state: 'done', result: parsed });
      return parsed;
    } catch (err) {
      setBoxState(idx, { state: 'done' }); // Still set to done so it stops loading
      throw err;
    }
  };

  const startSimulation = async () => {
    if (!scenarioData?.government_structure?.agents) return;
    const agents = scenarioData.government_structure.agents;

    setIsSimulating(true);
    setCurrentStep(-1);
    setError(null);
    setSaveStatus(null);
    setBoxes(make_idle());

    try {
      // ── Step 0: Infrastructure Team ──
      const infTraits: Record<string, Record<string, number>> = {};
      for (const id of ['E_INF1_01','E_INF1_02','E_INF1_03','E_INF1_04','E_INF1_05'])
        infTraits[id] = agents[id]?.traits ?? {};
      const infResult = await runStep(0,
        SYSTEM_PROMPTS.SECTOR_TEAM('Infrastructure',
          'Roads, transit lines, urban buffers, utility grids',
          ['E_INF1_01','E_INF1_02','E_INF1_03','E_INF1_04','E_INF1_05'],
          infTraits, POLICY)
      );

      // ── Step 1: Economic Dev Team ──
      const ecoTraits: Record<string, Record<string, number>> = {};
      for (const id of ['E_ECO2_01','E_ECO2_02','E_ECO2_03','E_ECO2_04','E_ECO2_05'])
        ecoTraits[id] = agents[id]?.traits ?? {};
      const ecoResult = await runStep(1,
        SYSTEM_PROMPTS.SECTOR_TEAM('Economic Development',
          'Budget surplus, tax revenue, business climate, employment',
          ['E_ECO2_01','E_ECO2_02','E_ECO2_03','E_ECO2_04','E_ECO2_05'],
          ecoTraits, POLICY)
      );

      // ── Step 2: Public Safety Team ──
      const pubTraits: Record<string, Record<string, number>> = {};
      for (const id of ['E_PUB3_01','E_PUB3_02','E_PUB3_03','E_PUB3_04','E_PUB3_05'])
        pubTraits[id] = agents[id]?.traits ?? {};
      const pubResult = await runStep(2,
        SYSTEM_PROMPTS.SECTOR_TEAM('Public Safety',
          'Pollution, emergency services, crime, community welfare',
          ['E_PUB3_01','E_PUB3_02','E_PUB3_03','E_PUB3_04','E_PUB3_05'],
          pubTraits, POLICY)
      );

      // ── Step 3: Sector Heads ──
      const headsResult = await runStep(3,
        SYSTEM_PROMPTS.SECTOR_HEADS([
          { name: 'Director Marcus Hale (Infrastructure)',  recommendation: infResult.recommendation },
          { name: 'Director Priya Nair (Economic Dev.)',    recommendation: ecoResult.recommendation },
          { name: 'Director Cole Reeves (Public Safety)',   recommendation: pubResult.recommendation },
        ], POLICY)
      );

      // ── Step 4: President ──
      await runStep(4,
        SYSTEM_PROMPTS.PRESIDENT(
          [
            { sector: 'Infrastructure',   recommendation: infResult.recommendation },
            { sector: 'Economic Dev.',    recommendation: ecoResult.recommendation },
            { sector: 'Public Safety',    recommendation: pubResult.recommendation },
          ],
          headsResult.recommendation,
          POLICY
        ),
        true
      );

    } catch (err: any) {
      console.error('Simulation error:', err);
      setError(err?.message ?? 'Unknown error. Check that Ollama is running on port 11434.');
    } finally {
      setIsSimulating(false);
      setCurrentStep(-1);
    }
  };

  const handleSaveSimulation = async () => {
    if (!scenarioData?.metadata?.id) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      const pipelineBoxes: PipelineBox[] = boxes.map((box, i) => {
        const isPres = i === 4;
        const result = box.result;
        
        let status: 'approved' | 'rejected' | 'neutral' = 'neutral';
        const rec = result?.recommendation.toUpperCase() ?? '';
        if (rec.includes('APPROVED')) status = 'approved';
        else if (rec.includes('REJECTED')) status = 'rejected';

        return {
          id: i < 3 ? `team_${i + 1}` : i === 3 ? 'heads' : 'pres_decision',
          title: box.title,
          duration: i < 3 ? '1-min deliberation' : i === 3 ? '5-min deliberation' : 'Final Verdict',
          transcript: result?.transcript.map(t => ({
            agent_id: t.agent_id,
            name: t.name,
            role: t.role,
            content: t.content
          })) ?? [],
          recommendation: result?.recommendation ?? '',
          summary: result?.summary ?? '',
          status,
          stats: result?.stats
        };
      });

      const simulationLog = { boxes: pipelineBoxes };

      const res = await fetch('/api/save-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenarioId: scenarioData.metadata.id, 
          simulationLog 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaveStatus('Simulation saved successfully!');
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const allDone = boxes.every(b => b.state === 'done');

  return (
    <div className="space-y-8 pb-20">
      {/* Control Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-800/40 border border-white/10 p-5 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isSimulating ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Behavioral Simulation</h2>
            <p className="text-[11px] text-slate-500">19 agents deliberating sequentially · Powered by <span className="text-blue-400 font-bold">gpt-oss:20b</span></p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {allDone && (
            <button
              onClick={handleSaveSimulation}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex-shrink-0 ${
                isSaving
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              }`}
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? 'Saving...' : 'Save as Static Log'}
            </button>
          )}
          
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex-shrink-0 ${
              isSimulating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] active:scale-95'
            }`}
          >
            {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isSimulating ? 'Deliberating...' : 'Start Live Sim'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium flex justify-between items-center animate-in fade-in slide-in-from-top-2">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">×</button>
        </div>
      )}
      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-medium flex gap-2 items-center animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          {saveStatus}
        </div>
      )}

      {/* Row 1: 3 Sector Team Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
        {[0, 1, 2].map(i => (
          <TeamBox key={i} box={boxes[i]} isActive={currentStep === i} voteTotal={5} />
        ))}
        <div className="hidden md:flex absolute -bottom-6 left-1/2 -translate-x-1/2">
          <ArrowDown size={24} className={currentStep >= 0 && currentStep < 3 ? 'text-blue-500 animate-bounce' : 'text-slate-800'} />
        </div>
      </div>

      {/* Row 2: Heads Box */}
      <div className="max-w-3xl mx-auto w-full relative">
        <HeadsBox box={boxes[3]} isActive={currentStep === 3} />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <ArrowDown size={24} className={currentStep === 3 ? 'text-amber-500 animate-bounce' : 'text-slate-800'} />
        </div>
      </div>

      {/* Row 3: President */}
      <div className="max-w-5xl mx-auto w-full">
        <PresidentBox box={boxes[4]} isActive={currentStep === 4} scenarioData={scenarioData} />
      </div>
    </div>
  );
};

// ... (Sub-components remain same)
const VoteDots = ({ voteFor, voteTotal }: { voteFor: number; voteTotal: number }) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    {Array.from({ length: voteTotal }, (_, i) => (
      <div key={i} className={`h-2 w-2 rounded-full ${i < voteFor ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
    ))}
    {voteTotal > 0 && <span className="text-[10px] font-black text-slate-400 ml-1">{voteFor}/{voteTotal}</span>}
  </div>
);

const ChatScroll = ({ box, height, accentColor = 'blue' }: { box: LiveBox; height: number; accentColor?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [box.streamText, box.result]);

  const isDone = box.state === 'done';
  const result = box.result;

  return (
    <div
      ref={ref}
      className={`custom-scrollbar overflow-y-auto pr-1 space-y-2`}
      style={{ height: `${height}px`, scrollBehavior: 'smooth' }}
    >
      {box.state === 'idle' && (
        <div className="flex items-center justify-center h-full text-slate-700 text-xs italic">Waiting to start…</div>
      )}
      {box.state === 'streaming' && !isDone && (
        <div className={`font-mono text-[10px] whitespace-pre-wrap break-words leading-relaxed text-${accentColor}-400`}>
          {box.streamText || ''}
          <span className={`inline-block w-1 h-3 bg-${accentColor}-500 animate-pulse ml-0.5 align-middle`} />
        </div>
      )}
      {isDone && result && result.transcript.map((msg, i) => (
        <div key={i} className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-black uppercase leading-none text-${accentColor}-400`}>{msg.name}</span>
            <span className="text-[8px] text-slate-700 font-mono">[{msg.agent_id}]</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug pl-2 border-l border-slate-800/80 break-words">{msg.content}</p>
        </div>
      ))}
    </div>
  );
};

const TeamBox = ({ box, isActive, voteTotal }: { box: LiveBox; isActive: boolean; voteTotal: number }) => {
  const isDone = box.state === 'done';
  return (
    <div className={`rounded-2xl border bg-slate-800/40 backdrop-blur p-4 flex flex-col transition-all duration-300 ${
      isActive ? 'ring-2 ring-blue-500/50 border-blue-500/20 bg-blue-500/[0.03]' : 'border-white/5'
    }`}>
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">1-min deliberation</span>
            {isActive && <Badge variant="info" className="text-[8px] py-0 animate-pulse">Live</Badge>}
            {isDone && <span className="text-[9px] text-emerald-500 font-bold">✓ Done</span>}
          </div>
          <h3 className="text-sm font-bold text-white">{box.title}</h3>
        </div>
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
          {isActive ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
        </div>
      </div>

      <ChatScroll box={box} height={160} accentColor="blue" />

      {isDone && box.result && (
        <div className="flex-shrink-0 border-t border-white/5 pt-3 mt-3 space-y-2">
          <VoteDots voteFor={box.result.voteFor} voteTotal={voteTotal} />
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider mb-1">Team Recommendation</p>
            <p className="text-xs text-white font-bold leading-snug break-words">{box.result.recommendation}</p>
          </div>
          {box.result.summary && (
            <p className="text-[9px] text-slate-500 italic leading-snug line-clamp-3">{box.result.summary}</p>
          )}
        </div>
      )}
    </div>
  );
};

const HeadsBox = ({ box, isActive }: { box: LiveBox; isActive: boolean }) => {
  const isDone = box.state === 'done';
  return (
    <div className={`rounded-2xl border p-5 flex flex-col backdrop-blur transition-all duration-300 ${
      isActive ? 'ring-2 ring-blue-500 bg-blue-500/[0.08] border-blue-500/30' : 'bg-slate-800/40 border-blue-500/15'
    }`}>
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-400'}`}>
            {isActive ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="info">Executive Meeting</Badge>
              {isActive && <span className="text-[9px] text-blue-400 font-black animate-pulse">Live ●</span>}
              {isDone && <span className="text-[9px] text-emerald-500 font-bold">✓ Done</span>}
            </div>
            <h3 className="text-sm font-bold text-white">Sector Heads Discussion</h3>
          </div>
        </div>
        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">5-min</span>
      </div>

      <ChatScroll box={box} height={188} accentColor="blue" />

      {isDone && box.result && (
        <div className="flex-shrink-0 border-t border-blue-500/10 pt-3 mt-3 space-y-2">
          <VoteDots voteFor={box.result.voteFor} voteTotal={3} />
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider mb-1">
              Heads' Recommendation to Mayor
            </p>
            <p className="text-sm font-bold text-white leading-snug break-words">{box.result.recommendation}</p>
          </div>
          {box.result.summary && (
            <p className="text-[9px] text-slate-500 italic leading-snug">{box.result.summary}</p>
          )}
        </div>
      )}
    </div>
  );
};

const PresidentBox = ({ box, isActive, scenarioData }: { box: LiveBox; isActive: boolean; scenarioData?: ScenarioData }) => {
  const isDone = box.state === 'done';
  const verdict = box.result?.recommendation ?? '';
  const isApproved = verdict.toUpperCase().includes('APPROVED');
  const isRejected = verdict.toUpperCase().includes('REJECTED');

  return (
    <div className={`rounded-3xl border p-6 lg:p-8 relative overflow-hidden transition-all duration-500 ${
      isActive ? 'ring-2 ring-amber-500 bg-amber-500/[0.06] border-amber-500/40' : 'bg-amber-500/[0.02] border-amber-500/20'
    }`}>
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 h-64 w-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row gap-6">
        {/* Left: Reasoning */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 transition-all ${
              isActive ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {isActive ? <Loader2 size={20} className="animate-spin" /> : 'EV'}
            </div>
            <div>
              <Badge variant="warning" className="mb-1 text-[9px]">Final Executive Order</Badge>
              <h2 className="text-xl font-black text-white tracking-tighter">Mayor Elara Voss</h2>
              <p className="text-[11px] text-amber-400">Mayor of Metroville</p>
            </div>
          </div>

          {/* Reasoning area */}
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Presidential Reasoning</p>
            <div className="bg-slate-800/60 rounded-2xl border border-white/10 p-4" style={{ height: '220px', overflowY: 'auto' }}>
              <ChatScroll box={box} height={188} accentColor="amber" />
            </div>
          </div>

          {/* Verdict */}
          {isDone && verdict && (
            <div className={`flex items-center gap-3 p-3.5 rounded-2xl border flex-shrink-0 ${
              isApproved ? 'bg-emerald-500/10 border-emerald-500/30' :
              isRejected ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700'
            }`}>
              {isApproved ? <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={20} /> :
               isRejected ? <XCircle className="text-red-400 flex-shrink-0" size={20} /> :
                            <ThumbsUp className="text-slate-400 flex-shrink-0" size={20} />}
              <div className="min-w-0">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Presidential Verdict</p>
                <p className={`text-sm font-black break-words ${isApproved ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-white'}`}>{verdict}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Impact */}
        {isDone && box.result?.stats ? (
          <div className="w-full lg:w-60 flex-shrink-0 space-y-3 animate-in fade-in zoom-in duration-700">
            <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
              <TrendingUp size={12} className="text-emerald-500" /> Projected Impact
            </h4>
            <ImpactStat label="Traffic" value={box.result.stats.traffic} from={`${Math.round((scenarioData?.initial_city_state?.metrics?.traffic_congestion || 0.72) * 100)}%`} to="Result" isGood={box.result.stats.traffic.startsWith('-')} />
            <ImpactStat label="Approval" value={box.result.stats.approval} from={`${Math.round((scenarioData?.initial_city_state?.metrics?.happiness || 0.68) * 100)}%`} to="Result" isGood={!box.result.stats.approval.startsWith('-')} />
            <ImpactStat label="Budget" value={box.result.stats.budget} from={`$${(scenarioData?.initial_city_state?.budget?.surplus || 30000000) / 1000000}M`} to="Result" isGood={!box.result.stats.budget.startsWith('-')} />
            <ImpactStat label="Housing" value={box.result.stats.housing} from={`${Math.round((scenarioData?.initial_city_state?.metrics?.housing_affordability || 0.45) * 100)}%`} to="Result" isGood={!box.result.stats.housing.startsWith('-')} />
          </div>
        ) : (
          <div className="w-full lg:w-60 flex-shrink-0 space-y-3 opacity-40">
            <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
              <TrendingUp size={12} className="text-slate-600" /> Projected Impact
            </h4>
            <div className="h-[268px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/50 rounded-2xl p-6 text-center">
              <Loader2 className={`text-slate-700 mb-3 ${isActive ? 'animate-spin text-blue-500/40' : ''}`} size={24} />
              <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest leading-relaxed">
                {isActive ? 'Analyzing Decision Impacts...' : 'Awaiting Mayor Verdict'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ImpactStat = ({ label, value, from, to, isGood }: { label: string; value: string; from: string; to: string; isGood: boolean }) => (
  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700">
    <div className="flex justify-between items-center mb-0.5">
      <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
      <span className={`text-[10px] font-black ${isGood ? 'text-emerald-400' : 'text-amber-500'}`}>{value}</span>
    </div>
    <div className="flex items-center gap-2 font-mono">
      <span className="text-[9px] text-slate-600">{from}</span>
      <div className="flex-1 h-px bg-slate-800" />
      <span className="text-xs font-bold text-white">{to}</span>
    </div>
  </div>
);
