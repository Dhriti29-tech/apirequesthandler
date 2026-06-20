import React from 'react';
import { Terminal, Shield, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TerminalLog = ({ logs }) => {
  return (
    <div className="glass overflow-hidden flex flex-col h-[600px] border-l border-white/5 relative bg-black/40">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Cpu size={120} />
      </div>

      <div className="bg-white/[0.02] p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-primary" />
          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.3em]">Traffic_Console</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-error/40"></div>
          <div className="w-2 h-2 rounded-full bg-warning/40"></div>
          <div className="w-2 h-2 rounded-full bg-primary/40"></div>
        </div>
      </div>
      
      <div className="p-4 font-mono text-[11px] overflow-y-auto terminal-scroll flex-1 custom-scroll">
        {logs.length === 0 && (
          <div className="text-slate-600 italic animate-pulse flex items-center gap-2">
            <Shield size={14} /> Listening for packets...
          </div>
        )}
        <AnimatePresence initial={false}>
          {logs.map((log, idx) => (
            <motion.div 
              key={idx} 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="group mb-2 flex items-center gap-3 py-1 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.03] transition-all rounded px-2"
            >
              <span className="text-slate-600 font-bold tabular-nums">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                log.status_code >= 500 ? 'bg-error/20 text-error border border-error/30' : 
                log.status_code >= 400 ? 'bg-warning/20 text-warning border border-warning/30' : 
                'bg-primary/20 text-primary border border-primary/30'
              }`}>
                {log.status_code}
              </span>
              <span className="text-slate-200 font-bold w-10">{log.method}</span>
              <span className="flex-1 text-slate-500 truncate group-hover:text-slate-300 transition-colors uppercase text-[9px] tracking-tighter">
                {log.path}
              </span>
              <span className={`text-right tabular-nums font-bold ${log.latency_ms > 500 ? 'text-warning' : 'text-slate-400'}`}>
                {log.latency_ms}ms
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-3 bg-white/[0.02] border-t border-white/5 text-[9px] font-mono text-slate-600 flex justify-between">
        <span>BUFFER: {logs.length}/50</span>
        <span className="text-primary italic animate-pulse">STREAMING_ACTIVE</span>
      </div>
    </div>
  );
};

export default TerminalLog;
