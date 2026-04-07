'use client';

import React from 'react';
import { Card, CardTitle, Badge } from './ui-elements';
import { Users, TrendingUp, AlertCircle, Building2, Landmark, Factory, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  city: any;
}

export const Dashboard = ({ city }: DashboardProps) => {
  if (!city) return null;

  const districts = Object.entries(city.districts || {});
  const metrics = Object.entries(city.metrics || {});

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-400">Population</p>
            <p className="text-xl md:text-2xl font-bold">{city.population?.toLocaleString()}</p>
          </div>
        </Card>
        
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-400">Budget Surplus</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              ${(city.budget?.surplus / 1000000).toFixed(1)}M
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-400">Happiness Index</p>
            <p className="text-xl md:text-2xl font-bold text-purple-400">
              {(city.metrics?.happiness * 100).toFixed(0)}%
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-400">Revenue</p>
            <p className="text-xl md:text-2xl font-bold">
              ${(city.budget?.revenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Overview */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {districts.map(([name, data]: [string, any], i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-l-4 border-l-blue-500/50">
                <div className="flex items-center gap-2 mb-4 text-blue-400">
                  {name.includes('Residential') && <Building2 size={18} />}
                  {name.includes('Downtown') && <Landmark size={18} />}
                  {name.includes('Industrial') && <Factory size={18} />}
                  <span className="font-semibold text-sm uppercase tracking-wider">{name}</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(data).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-slate-200 font-medium">
                        {typeof value === 'number' && value < 1 ? (value * 100).toFixed(0) + '%' : value.toString().substring(0, 20)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* System Health / Metrics */}
        <Card className="h-full border-slate-700/50">
          <CardTitle className="flex items-center gap-2 text-slate-300">
            <Activity size={18} /> City Vitals
          </CardTitle>
          <div className="space-y-5">
            {metrics.map(([name, val]: [string, any]) => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-slate-400">{name.replace('_', ' ')}</span>
                  <span className="text-slate-200">{(val * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${val * 100}%` }}
                    className={`h-full ${val > 0.7 ? 'bg-red-500/70' : val > 0.4 ? 'bg-blue-500/70' : 'bg-emerald-500/70'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues List */}
        <Card>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle size={18} /> Priority Issues
          </CardTitle>
          <div className="space-y-3">
            {city.issues?.map((issue: string, i: number) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 group hover:border-red-500/20 transition-colors">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{issue}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Infrastructure Quick View */}
        <Card>
         <CardTitle className="text-amber-400">Infrastructure Assets</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {Object.entries(city.infrastructure || {}).map(([name, val]: [string, any]) => (
              <div key={name} className="p-3 rounded-lg border border-slate-700/20 bg-slate-800/10">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{name}</p>
                <p className="text-lg font-mono text-slate-200">{val}</p>
              </div>
            ))}
         </div>
        </Card>
      </div>
    </div>
  );
};
