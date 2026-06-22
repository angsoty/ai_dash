import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Activity, Zap, Layers, RefreshCw } from 'lucide-react';

// 🔹 ប្រភពទិន្នន័យ API Nodes ទាំង ៦ គ្រាប់របស់បងសម្រាប់បង្ហាញប្រព័ន្ធ Multi-homing
type ApiNode = { url: string; status: 'ONLINE' | 'STANDBY' | 'ROUTING'; ping: number };

export function Portfolio() {
    const [winRate, setWinRate] = useState(78.51);
    const [latency, setLatency] = useState(12);
    const [logs, setLogs] = useState<string[]>([
        '[SYSTEM]: Initializing Neural Core v4...',
        '[MATRIX]: SMC/ICT Liquidity Matrix active.',
        '[REVERB]: Connected to Port 8085.'
    ]);

    const [nodes, setNodes] = useState<ApiNode[]>([
        { url: 'api.binance.com', status: 'ONLINE', ping: 12 },
        { url: 'api-gcp.binance.com', status: 'ROUTING', ping: 18 },
        { url: 'api1.binance.com', status: 'STANDBY', ping: 15 },
        { url: 'api2.binance.com', status: 'STANDBY', ping: 14 },
        { url: 'api3.binance.com', status: 'STANDBY', ping: 22 },
        { url: 'api4.binance.com', status: 'STANDBY', ping: 19 },
    ]);

    // 🔥 Simulation ឱ្យតម្លៃលេខ និង Log រត់ភ្លឹបភ្លែតៗដូចម៉ាស៊ីន AI កំពុងវិភាគពិតៗ
    useEffect(() => {
        const interval = setInterval(() => {
            // ប្តូរ Latency តិចៗ
            setLatency(Math.floor(Math.random() * 5) + 10);
            
            // បាញ់បញ្ជូន SMC/ICT Matrix Logs ចូលអេក្រង់បែប Sci-Fi
            const signals = [
                `[SMC]: Order Block (OB) detected at Liquidity Level.`,
                `[ICT]: Fair Value Gap (FVG) filled on M15 Timeframe.`,
                `[CORE]: Multi-homed API Gateway rotated successfully.`,
                `[QUANT]: High-frequency algorithmic trade executed.`
            ];
            const randomSignal = signals[Math.floor(Math.random() * signals.length)];
            
            setLogs(prev => [randomSignal, ...prev.slice(0, 8)]);
            
            // លួចផ្លាស់ប្តូរតម្លៃ Ping របស់ Nodes ឱ្យរស់រវើក
            setNodes(prev => prev.map(n => ({...n, ping: n.status === 'ONLINE' ? Math.floor(Math.random() * 5) + 10 : n.ping})));
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen text-gray-100 p-6 font-mono select-none relative overflow-hidden">
            
            {/* 🌌 TOP HEADER HUD */}
            <header className="flex justify-between items-center border-b border-emerald-500/30 pb-4 mb-8 backdrop-blur-md px-4 rounded-lg bg-gray-950/40">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <Cpu className="h-6 w-6 text-emerald-400 animate-spin [animation-duration:10s]" />
                        <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-emerald-400 tracking-wider text-shadow-emerald">NEURAL CORE v4</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Quantum Trading Control Center</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <span className="text-[10px] block text-gray-500 tracking-widest">ENGINE LATENCY</span>
                        <span className="text-emerald-400 text-sm font-bold flex items-center justify-end gap-1">
                            <Activity className="h-3 w-3 animate-pulse" /> {latency}ms
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] block text-gray-500 tracking-widest">AI WIN RATE</span>
                        <span className="text-emerald-400 text-sm font-bold text-shadow-emerald">{winRate}%</span>
                    </div>
                </div>
            </header>

            {/* 🎯 MAIN MATRIX GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
                
                {/* 📟 COLUMN 1: LIVE CONFLUENCE MONITOR (THE TERMINAL LOGS) */}
                <div className="lg:col-span-2 flex flex-col h-[500px] bg-gray-950/60 backdrop-blur-xl border border-emerald-500/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                    <div className="bg-gray-900/80 px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider">
                            <Terminal className="h-4 w-4" />
                            <span>SMC / ICT LIVE CONFLUENCE FEED</span>
                        </div>
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    {/* 🔄 LOGS CONTENT */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-2.5 text-xs bg-black/40 scrollbar-none">
                        {logs.map((log, index) => (
                            <div 
                                key={index} 
                                className={`p-2.5 rounded-lg border transition-all duration-300 transform translate-x-0 ${
                                    index === 0 
                                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 font-bold scale-[1.01] shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' 
                                        : 'bg-gray-950/40 border-gray-900 text-gray-400'
                                }`}
                            >
                                <span className="opacity-40 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🛡️ COLUMN 2: FAILOVER INFRASTRUCTURE & CONTROLS */}
                <div className="space-y-6 flex flex-col justify-between">
                    
                    {/* INFRASTRUCTURE MONITOR */}
                    <div className="bg-gray-950/60 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider mb-4 uppercase">
                            <Shield className="h-4 w-4" />
                            <span>API Gateway Failover Matrix</span>
                        </div>

                        <div className="space-y-2.5">
                            {nodes.map((node, i) => (
                                <div key={i} className="flex items-center justify-between bg-black/30 p-2.5 rounded-lg border border-gray-900 hover:border-emerald-500/20 transition-all">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                            node.status === 'ONLINE' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' :
                                            node.status === 'ROUTING' ? 'text-amber-400 bg-amber-400 animate-pulse' : 'bg-gray-600'
                                        }`} />
                                        <span className="text-xs font-mono text-gray-400">{node.url}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-gray-600 font-bold font-mono">{node.ping}ms</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                            node.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400' :
                                            node.status === 'ROUTING' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-900 text-gray-500'
                                        }`}>{node.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🕹️ FUTURISTIC INTERACTIVE BUTTONCORE */}
                    <div className="bg-gray-950/40 border border-emerald-500/10 p-4 rounded-xl space-y-3">
                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 to-transparent text-emerald-400 font-bold hover:from-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group">
                            <div className="flex items-center gap-3 text-xs tracking-widest uppercase">
                                <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span>Execute Neural Algorithm</span>
                            </div>
                            <Layers className="h-4 w-4 opacity-50" />
                        </button>

                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border border-gray-900 bg-black/40 text-gray-500 text-xs tracking-widest uppercase hover:text-gray-300 hover:border-gray-800">
                            <span>Recalibrate Risk Matrix</span>
                            <RefreshCw className="h-3 w-3" />
                        </button>
                    </div>

                </div>
            </div>

            {/* 📟 AMBIENT DECORATIONS */}
            <div className="absolute right-4 bottom-4 text-[9px] text-gray-700 pointer-events-none select-none text-right">
                SECURE TERMINAL CONNECTION // PROT_443<br />
                AUTHORIZED DEVELOPMENT CORE ONLY // 2026
            </div>
        </div>
    );
}