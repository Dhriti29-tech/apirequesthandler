import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const LiveChart = ({ logs }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (logs.length > 0) {
      const latest = logs[0];
      setData((prev) => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          latency: latest.latency_ms,
          isError: latest.status_code >= 500
        }].slice(-30);
        return newData;
      });
    }
  }, [logs]);

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0d0d0f',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        lineStyle: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.time),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.03)' } },
      axisLabel: { color: '#64748b', fontSize: 10 }
    },
    series: [
      {
        name: 'Latency',
        data: data.map(d => d.latency),
        type: 'line',
        smooth: 0.4,
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#00ff9f' },
        lineStyle: { 
          width: 3, 
          color: '#00ff9f',
          shadowColor: 'rgba(0, 255, 159, 0.5)',
          shadowBlur: 10
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 159, 0.2)' },
            { offset: 1, color: 'rgba(0, 255, 159, 0)' }
          ])
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 30,
          data: data
            .map((d, idx) => d.isError ? { coord: [idx, d.latency], value: 'ERR', itemStyle: { color: '#ff4d4d' } } : null)
            .filter(Boolean)
        }
      }
    ],
    animation: true,
    animationDuration: 300
  };

  return (
    <div className="glass p-6 h-[400px] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-white font-bold text-lg tracking-tight uppercase">System Core Pulse</h3>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest">Real-time latency spikes (ms)</p>
        </div>
        <div className="flex items-center gap-3 glass px-3 py-1 bg-white/5 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00ff9f]"></span>
          <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">Live Stream</span>
        </div>
      </div>
      <div className="flex-1 mt-4">
        <ReactECharts 
          option={option} 
          style={{ height: '100%', width: '100%' }} 
          notMerge={true} 
        />
      </div>
    </div>
  );
};

export default LiveChart;
