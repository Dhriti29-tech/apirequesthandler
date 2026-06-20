import React from 'react';
import { Activity, Zap, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, color, subValue }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.1)' }}
    className="glass p-6 flex flex-col relative group"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
      <Icon size={48} />
    </div>
    
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${color}`}>
        <Icon size={18} />
      </div>
      <span className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">{title}</span>
    </div>

    <div className="flex items-baseline gap-2">
      <div className="text-4xl font-black text-white tracking-tighter">{value}</div>
      <span className="text-[10px] text-slate-500 font-mono italic">{subValue}</span>
    </div>
    
    <div className="mt-4 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full origin-left bg-gradient-to-r from-transparent to-current ${color}`}
      />
    </div>
  </motion.div>
);

const MetricCards = ({ metrics }) => {
  const errorRate = metrics.totalRequests > 0 
    ? ((metrics.errorCount / metrics.totalRequests) * 100).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <MetricCard 
        title="Live Traffic" 
        value={metrics.totalRequests.toLocaleString()} 
        subValue="TOTAL REQ"
        icon={Activity} 
        color="text-primary" 
      />
      <MetricCard 
        title="System Lag" 
        value={`${metrics.avgLatency}ms`} 
        subValue="AVG LATENCY"
        icon={Zap} 
        color="text-warning" 
      />
      <MetricCard 
        title="Health Score" 
        value={`${errorRate}%`} 
        subValue="ERROR RATE"
        icon={AlertCircle} 
        color={errorRate > 5 ? "text-error" : "text-primary"} 
      />
      <MetricCard 
        title="Uptime" 
        value="99.9%" 
        subValue="ACTIVE NODES"
        icon={Clock} 
        color="text-primary" 
      />
    </div>
  );
};

export default MetricCards;
