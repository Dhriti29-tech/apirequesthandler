import React, { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import MetricCards from './components/MetricCards';
import LiveChart from './components/LiveChart';
import TerminalLog from './components/TerminalLog';
import { ShieldCheck, Activity, Settings, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // Dynamic Backend URL for Production (Render)
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? '127.0.0.1:9000' : 'localhost:9000');
  const wsUrl = `ws://${backendBaseUrl}/ws/traffic`;
  const httpUrl = `http://${backendBaseUrl}/api/v1/metrics`;
    
  const { logs, metrics } = useWebSocket(wsUrl, httpUrl);
  const [showPanic, setShowPanic] = useState(false);

  useEffect(() => {
    const errorRate = metrics.totalRequests > 10 ? (metrics.errorCount / metrics.totalRequests) * 100 : 0;
    if (errorRate > 10) setShowPanic(true);
    else if (errorRate < 2) setShowPanic(false);
  }, [metrics]);

  return (
    <div className="min-h-screen bg-background bg-grid text-slate-200">
      {/* Sidebar Sidebar Placeholder */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-card border-r border-white/5 flex flex-col items-center py-8 gap-8 z-30 transition-all hover:w-20">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(0,255,159,0.3)]">
          <ShieldCheck className="text-primary" size={24} />
        </div>
        <div className="flex-1 flex flex-col gap-6 text-slate-500">
          <Activity className="hover:text-primary cursor-pointer transition-colors" size={20} />
          <Bell className="hover:text-primary cursor-pointer transition-colors" size={20} />
          <Settings className="hover:text-primary cursor-pointer transition-colors" size={20} />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
          <User size={16} />
        </div>
      </div>

      <div className="pl-16 min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between glass sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">PulseProxy <span className="text-primary text-[10px] font-bold tracking-widest ml-2 border border-primary/30 px-2 py-0.5 rounded-full not-italic">V1.0</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-[11px] font-mono uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#00ff9f]"></span> System Nominal</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> Localhost:8001</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
          <MetricCards metrics={metrics} />
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 flex flex-col gap-8">
              <LiveChart logs={logs} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-6 group hover:border-primary/20 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Activity size={18} /></div>
                    <h4 className="text-white font-bold tracking-tight">Active Nodes</h4>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white">12</span>
                    <span className="text-primary text-xs font-bold mb-1.5">+2 from prev hour</span>
                  </div>
                </div>
                
                <div className="glass p-6 group hover:border-error/20 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-error/10 rounded-lg text-error"><Bell size={18} /></div>
                    <h4 className="text-white font-bold tracking-tight">System Alerts</h4>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white">{metrics.errorCount}</span>
                    <span className="text-slate-500 text-xs font-bold mb-1.5">Unresolved</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="xl:col-span-1">
              <TerminalLog logs={logs} />
            </div>
          </div>
        </main>
      </div>

      {/* Panic System Overlay */}
      <AnimatePresence>
        {showPanic && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-error/10 border border-error p-16 rounded-[40px] shadow-[0_0_150px_rgba(255,77,77,0.4)] flex flex-col items-center gap-8 max-w-lg"
            >
              <div className="w-24 h-24 bg-error rounded-full flex items-center justify-center shadow-[0_0_50px_#ff4d4d] animate-pulse">
                <Bell size={48} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-white mb-4 uppercase italic tracking-tighter">System Crisis!</h2>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                  <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1/2 h-full bg-white shadow-[0_0_15px_#fff]" />
                </div>
                <p className="text-white/80 font-mono text-sm leading-relaxed">
                  CRITICAL: Error rate spike detected at <span className="text-white underline">{((metrics.errorCount/metrics.totalRequests)*100).toFixed(1)}%</span>.
                  Manual intervention recommended immediately.
                </p>
              </div>
              <button onClick={() => setShowPanic(false)} className="px-10 py-4 bg-white text-error font-black uppercase text-sm tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Acknowledge Alert
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
