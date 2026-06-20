# 🛰️ PulseProxy - Real-time API Monitor

PulseProxy is a premium, high-performance API traffic monitor and health dashboard. It provides real-time visualization of your API latency, traffic volume, and error rates with a futuristic glassmorphism UI.

![PulseProxy Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000)

## ✨ Features
- **Real-time Latency Tracking**: Smooth, glowing charts powered by Apache ECharts.
- **Health Monitoring**: Instant alerts when error rates exceed thresholds.
- **Traffic Console**: Live-scrolling terminal for every request log.
- **Smart Fallback**: Dual-mode data fetching (WebSocket with HTTP Polling fallback).
- **Asynchronous Backend**: Fast and non-blocking performance with FastAPI and MongoDB.

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- MongoDB (running locally)

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
# Create a .env file with your MONGODB_URL and PORT=9000
python -m app.main
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Simulator (To see live data)
```bash
cd backend
python scripts/simulator.py
```

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (v4), Framer Motion, Apache ECharts.
- **Backend**: FastAPI, Motor (MongoDB), Pydantic v2.
- **Real-time**: WebSockets & HTTP Polling Fallback.

## 📄 License
MIT
