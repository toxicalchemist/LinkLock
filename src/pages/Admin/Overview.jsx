import React, { useEffect, useState } from 'react';
import { getAdminOverview } from '../../services/api';
import { Activity, ShieldCheck, HardDrive, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Overview = () => {
  const [data, setData] = useState({ totalUsers: 0, activeSecrets: 0, totalPurged: 0, chartData: [], logs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getAdminOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const chartData = data.chartData && data.chartData.length > 0 ? data.chartData : [
    { time: '00:00', links: 0 },
    { time: '04:00', links: 0 },
    { time: '08:00', links: 0 },
    { time: '12:00', links: 0 },
    { time: '16:00', links: 0 },
    { time: '20:00', links: 0 },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-[#2A2A2A] pb-6">
        <h1 className="text-3xl font-light tracking-tight text-slate-100">System Overview</h1>
        <p className="text-slate-500 font-mono text-sm">Real-time telemetry and resource usage statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center gap-3 text-slate-400 font-mono text-sm uppercase tracking-widest">
            <ShieldCheck size={18} className="text-emerald-500" />
            Total Users
          </div>
          <div className="text-5xl font-mono text-slate-100">
            {loading ? '-' : data.totalUsers}
          </div>
          <div className="text-slate-500 text-sm font-mono">
            System registered accounts
          </div>
        </div>

        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center gap-3 text-slate-400 font-mono text-sm uppercase tracking-widest">
            <Zap size={18} className="text-copper" />
            Active Secrets
          </div>
          <div className="text-5xl font-mono text-slate-100">
            {loading ? '-' : data.activeSecrets}
          </div>
          <div className="text-slate-500 text-sm font-mono">
            Currently live instances
          </div>
        </div>

        <div className="bg-[#121212] border border-red-900/50 rounded-xl p-6 flex flex-col gap-4 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-sm uppercase tracking-widest relative z-10">
            <HardDrive size={18} className="text-red-500" />
            Total Purged
          </div>
          <div className="text-5xl font-mono text-red-500 relative z-10">
            {loading ? '-' : data.totalPurged}
          </div>
          <div className="text-slate-500 text-sm font-mono relative z-10">
            Securely erased links
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm uppercase tracking-widest mb-6">
          <Activity size={18} className="text-copper" />
          Data Throughput (Links Created Today)
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLinks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B87333" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#B87333" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121212', borderColor: '#2A2A2A', borderRadius: '8px' }}
                itemStyle={{ color: '#B87333' }}
              />
              <Area type="monotone" dataKey="links" stroke="#B87333" fillOpacity={1} fill="url(#colorLinks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
