import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url, httpUrl) => {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    errorCount: 0,
    avgLatency: 0,
    latencyBuffer: []
  });
  
  const socketRef = useRef(null);
  const pollingRef = useRef(null);

  const updateState = (data) => {
    setLogs((prev) => {
      if (prev.some(l => l.timestamp === data.timestamp && l.path === data.path)) return prev;
      return [data, ...prev].slice(0, 50);
    });

    setMetrics((prev) => {
      const newTotal = prev.totalRequests + 1;
      const newErrorCount = data.status_code >= 500 ? prev.errorCount + 1 : prev.errorCount;
      const newLatencyBuffer = [...prev.latencyBuffer, data.latency_ms || 0].slice(-20);
      const newAvgLatency = newLatencyBuffer.reduce((a, b) => a + b, 0) / Math.max(1, newLatencyBuffer.length);

      return {
        totalRequests: newTotal,
        errorCount: newErrorCount,
        avgLatency: Math.round(newAvgLatency),
        latencyBuffer: newLatencyBuffer
      };
    });
  };

  useEffect(() => {
    // 1. WebSocket Attempt
    try {
      socketRef.current = new WebSocket(url);
      socketRef.current.onmessage = (event) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        const data = JSON.parse(event.data);
        updateState(data);
      };
      socketRef.current.onerror = () => startPolling();
    } catch (e) {
      startPolling();
    }

    // 2. Polling Fallback
    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(httpUrl || url.replace('ws://', 'http://').replace('/ws/traffic', '/api/v1/metrics'));
          const data = await res.json();
          setMetrics(prev => ({
            ...prev,
            totalRequests: data.metrics.totalRequests,
            errorCount: data.metrics.errorCount,
            avgLatency: Math.round(data.metrics.avgLatency)
          }));
          setLogs(data.logs);
        } catch (err) {}
      }, 2000); // Polling every 2 seconds for production stability
    };

    const timeout = setTimeout(() => {
      if (logs.length === 0) startPolling();
    }, 4000);

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(timeout);
    };
  }, [url, httpUrl]);

  return { logs, metrics };
};
