import React, { useState, useEffect } from 'react';
import MetricCards from './components/MetricCards';
import LiveChart from './components/LiveChart';
import TerminalLog from './components/TerminalLog';
import { useWebSocket } from './hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, Settings, ShieldAlert, Wifi, Globe, Server, Trash2, Sliders, Palette, Zap, CheckCircle2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('traffic');
  const [themeColor, setThemeColor] = useState('cyan'); // cyan, lime, rose, purple
  const [isSimulationActive, setIsSimulationActive] = useState(true);
  
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? '127.0.0.1:9000' : 'localhost:9000');
  const wsUrl = `ws://${backendBaseUrl}/ws/traffic`;
  const httpUrl = `http://${backendBaseUrl}/api/v1/metrics`;
    
  const { logs, metrics } = useWebSocket(wsUrl, httpUrl);
  const [showPanic, setShowPanic] = useState(false);

  // Theme Mapping
  const themes = {
    cyan: { primary: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]', hex: '#22d3ee' },
    lime: { primary: 'text-lime-400', bg: 'bg-lime-500/20', border: 'border-lime-500/30', glow: 'shadow-[0_0_20px_rgba(163,230,53,0.2)]', hex: '#a3e635' },
    rose: { primary: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30', glow: 'shadow-[0_0_20px_rgba(251,113,133,0.2)]', hex: '#fb7185' },
    purple: { primary: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.2)]', hex: '#c084fc' }
  };

  const currentTheme = themes[themeColor];

  useEffect(() => {
    const errorRate = (metrics.errorCount / Math.max(1, metrics.totalRequests)) * 100;
    if (errorRate > 10 && !showPanic) {
      setShowPanic(true);
    }
  }, [metrics, showPanic]);

  return (
    <div className={`min-h-screen bg-[#020202] text-white flex font-sans selection:bg-${themeColor}-500/30 transition-colors duration-700`}>
      {/* --- Sidebar --- */}
      <nav className="w-24 bg-[#080808] border-r border-white/5 flex flex-col items-center py-10 gap-12 z-20">
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`p-3 bg-${themeColor}-500/10 rounded-2xl border ${currentTheme.border} mb-6`}
        >
          <Zap className={currentTheme.primary} size={28} />
        </motion.div>
        
        <div className="flex flex-col gap-8 flex-1">
          <button 
            onClick={() => setActiveTab('traffic')}
            className={`p-5 rounded-2xl transition-all duration-500 group relative ${activeTab === 'traffic' ? `${currentTheme.bg} ${currentTheme.primary} ${currentTheme.border} ${currentTheme.glow}` : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            <Activity size={24} />
            {activeTab === 'traffic' && <motion.div layoutId="side-indicator" className={`absolute -left-12 w-1 h-8 bg-${themeColor}-500 rounded-full`} />}
          </button>

          <button 
            onClick={() => setActiveTab('alerts')}
            className={`p-5 rounded-2xl transition-all duration-500 group relative ${activeTab === 'alerts' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            <Bell size={24} />
            {metrics.errorCount > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
            {activeTab === 'alerts' && <motion.div layoutId="side-indicator" className="absolute -left-12 w-1 h-8 bg-amber-500 rounded-full" />}
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-5 rounded-2xl transition-all duration-500 group relative ${activeTab === 'settings' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={24} />
            {activeTab === 'settings' && <motion.div layoutId="side-indicator" className="absolute -left-12 w-1 h-8 bg-indigo-500 rounded-full" />}
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 p-10 overflow-y-auto relative">
        {/* Glow Effects */}
        <div className={`fixed -top-20 -right-20 w-[500px] h-[500px] bg-${themeColor}-500/5 blur-[120px] pointer-events-none rounded-full`}></div>
        
        <header className="flex justify-between items-end mb-12 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 bg-${themeColor}-500/10 border ${currentTheme.border} text-[10px] font-black uppercase tracking-[0.2em] ${currentTheme.primary} rounded-md`}>Nexus Protocol</span>
              <span className="text-gray-600 text-xs font-mono tracking-tighter">Lat: 28.6139 | Lon: 77.2090</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter">
              PULSE<span className={`${currentTheme.primary} italic`}>PROXY</span>
            </h1>
          </div>
          
          <div className="flex gap-6 items-center">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Server Latency</p>
              <p className={`text-xl font-mono ${currentTheme.primary}`}>{metrics.avgLatency}ms</p>
            </div>
            <div className="h-12 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <div className={`w-2.5 h-2.5 rounded-full ${isSimulationActive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
              <span className={`text-sm font-bold tracking-tight ${isSimulationActive ? 'text-green-500' : 'text-red-500'}`}>
                {isSimulationActive ? 'NODE: ACTIVE' : 'NODE: DISCONNECTED'}
              </span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'traffic' && (
            <motion.div 
              key="traffic"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="space-y-10"
            >
              <MetricCards metrics={metrics} />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3">
                  <LiveChart logs={logs} customColor={currentTheme.hex} />
                </div>
                <div className="lg:col-span-1">
                  <TerminalLog logs={logs} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-bold">Total Violations</p>
                  <p className="text-4xl font-black text-red-500">{metrics.errorCount}</p>
                </div>
                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-bold">Risk Level</p>
                  <p className={`text-4xl font-black ${metrics.errorCount > 5 ? 'text-red-500' : 'text-amber-500'}`}>
                    {metrics.errorCount > 10 ? 'Urgant' : metrics.errorCount > 5 ? 'High' : 'Moderate'}
                  </p>
                </div>
                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-bold">Last Updated</p>
                  <p className="text-4xl font-black text-blue-400">Just Now</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 overflow-hidden relative">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <ShieldAlert size={28} className="text-amber-400" /> THREAT_LOGS_ENGINE
                  </h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-full transition-all">
                    <Trash2 size={14} /> Clear Session History
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                  {logs.filter(l => l.status_code >= 400).length === 0 ? (
                    <div className="text-center py-20">
                      <CheckCircle2 size={64} className="mx-auto text-green-500/20 mb-4" />
                      <p className="text-gray-500 font-mono italic">Guardian Protocol active. No threats intercepted.</p>
                    </div>
                  ) : (
                    logs.filter(l => l.status_code >= 400).map((log, idx) => (
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={idx} 
                        className="p-6 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 rounded-2xl flex justify-between items-center group transition-all"
                      >
                        <div className="flex gap-6 items-center">
                          <div className={`p-4 rounded-xl flex items-center justify-center font-mono text-lg font-black ${log.status_code >= 500 ? 'bg-red-500 text-white shadow-[0_0_20px_#ef4444]' : 'bg-amber-500 text-black'}`}>
                            {log.status_code}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-gray-300">{log.method}</span>
                              <span className="text-lg font-black tracking-tighter">{log.path}</span>
                            </div>
                            <div className="flex gap-4 items-center">
                              <span className={`text-[10px] uppercase font-black tracking-widest ${log.status_code >= 500 ? 'text-red-400' : 'text-amber-400'}`}>
                                {log.status_code >= 500 ? 'INTERNAL_SERVER_FAIL' : 'CLIENT_REQUEST_CONFLICT'}
                              </span>
                              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                              <span className="text-[10px] text-gray-500 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-white mb-1">{log.latency_ms}ms</p>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest">{log.timestamp}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <Palette size={24} className={currentTheme.primary} /> UI_CORE_ENGINE
                </h2>
                
                <div className="space-y-10">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 block mb-4 font-black">Selection Hue Settings</label>
                    <div className="flex gap-4">
                      {Object.keys(themes).map(color => (
                        <button 
                          key={color}
                          onClick={() => setThemeColor(color)}
                          className={`w-14 h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center ${themeColor === color ? `border-${color}-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-110` : 'border-transparent opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: themes[color].hex }}
                        >
                          {themeColor === color && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all">
                          <Globe size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Global Data Synchronization</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Multi-region clustering active</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 size={18} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all">
                          <Wifi size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Live Packet Interception</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Real-time sampling at 100%</p>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-cyan-500 rounded-full flex items-center px-1 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col justify-between">
                <div>
                   <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Sliders size={24} className="text-indigo-400" /> INFRA_CONFIG
                  </h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-xs text-gray-400 leading-relaxed">
                      <p className="text-cyan-400 mb-2">// Server Configuration Payload</p>
                      <p>ADDRESS: <span className="text-white">{backendBaseUrl}</span></p>
                      <p>PROTOCOL: <span className="text-white">WSS (SECURE/ENCRYPTED)</span></p>
                      <p>HEARTBEAT: <span className="text-white">ENABLED (EVERY 5S)</span></p>
                      <p>BUFFER_SIZE: <span className="text-white">50 REQUESTS</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-black">Simulation Control</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isSimulationActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isSimulationActive ? 'HEALTHY' : 'INTERRUPTED'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsSimulationActive(!isSimulationActive)}
                    className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${isSimulationActive ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.3)]' : `bg-${themeColor}-500 hover:bg-${themeColor}-400 text-black shadow-[0_0_40px_rgba(34,211,238,0.3)]`}`}
                  >
                    {isSimulationActive ? 'TERMINATE SIMULATION' : 'RESTART CORE ENGINE'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- Panic Overlay --- */}
      <AnimatePresence>
        {showPanic && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              style={{ borderImage: 'conic-gradient(from 0deg, #ef4444, transparent, #ef4444) 1' }}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full bg-red-950/20 border-4 border-red-500 rounded-[4rem] p-16 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent"></div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-32 h-32 bg-red-500 rounded-full mx-auto mb-10 flex items-center justify-center shadow-[0_0_80px_rgba(239,68,68,0.7)]"
              >
                <ShieldAlert size={64} className="text-white" />
              </motion.div>
              <h2 className="text-6xl font-black tracking-tighter mb-6 text-white uppercase italic">Critical Breach!</h2>
              <div className="w-full h-2 bg-white/5 rounded-full mb-10 relative overflow-hidden">
                <motion.div 
                   animate={{ x: ['-100%', '100%'] }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 bg-red-500 w-1/3"
                ></motion.div>
              </div>
              <p className="text-red-200 text-lg font-mono mb-12 leading-tight uppercase tracking-tight">
                Alert: Security protocols bypassed. <br/>Error rate spike: {((metrics.errorCount / metrics.totalRequests) * 100).toFixed(1)}%. <br/>Targeting infrastructure node alpha.
              </p>
              <button 
                onClick={() => { setShowPanic(false); metrics.errorCount = 0; }}
                className="w-full py-6 bg-white text-red-600 font-black rounded-3xl text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
              >
                FORCE REBOOT SYSTEM
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
