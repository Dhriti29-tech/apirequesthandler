import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
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
      // Avoid duplicates if polling and websocket both work
      if (prev.some(l => l.timestamp === data.timestamp && l.path === data.path)) return prev;
      return [data, ...prev].slice(0, 50);
    });

    setMetrics((prev) => {
      const newTotal = prev.totalRequests + 1;
      const newErrorCount = data.status_code >= 500 ? prev.errorCount + 1 : prev.errorCount;
      const newLatencyBuffer = [...prev.latencyBuffer, data.latency_ms].slice(-20);
      const newAvgLatency = newLatencyBuffer.reduce((a, b) => a + b, 0) / newLatencyBuffer.length;

      return {
        totalRequests: newTotal,
        errorCount: newErrorCount,
        avgLatency: Math.round(newAvgLatency),
        latencyBuffer: newLatencyBuffer
      };
    });
  };

  useEffect(() => {
    // 1. Try WebSocket
    socketRef.current = new WebSocket(url);

    socketRef.current.onmessage = (event) => {
      if (pollingRef.current) clearInterval(pollingRef.current); // Stop polling if WS works
      const data = JSON.parse(event.data);
      updateState(data);
    };

    socketRef.current.onerror = () => {
      console.warn("WebSocket failed, falling back to HTTP Polling...");
      startPolling();
    };

    // 2. Fallback: Start polling if no message in 3 seconds
    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(url.replace('ws://', 'http://').replace('/ws/traffic', '/api/v1/metrics'));
          const data = await res.json();
          // Update total metrics
          setMetrics(prev => ({
            ...prev,
            totalRequests: data.metrics.totalRequests,
            errorCount: data.metrics.errorCount,
            avgLatency: Math.round(data.metrics.avgLatency)
          }));
          // Update logs
          setLogs(data.logs);
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1000);
    };

    const timeout = setTimeout(() => {
      if (logs.length === 0) startPolling();
    }, 3000);

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (pollingRef.current) clearInterval(pollingRef.current);
      clearTimeout(timeout);
    };
  }, [url]);

  return { logs, metrics };
};
