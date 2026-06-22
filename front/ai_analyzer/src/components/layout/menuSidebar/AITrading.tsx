import { useState, useEffect, useRef } from 'react';
import { Target, Layers, Activity, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

// 🔹 ប្រភេទ Timeframes សម្រាប់យុទ្ធសាស្ត្រ SMC/ICT Scalping
type TimeframeOption = { label: string; value: string; desc: string };

export function AITrading() {
    const [selectedTf, setSelectedTf] = useState<string>('5'); // Default M5 សម្រាប់ Scalping Entry
    const containerRef = useRef<HTMLDivElement>(null);

    const timeframes: TimeframeOption[] = [
        { label: 'M1', value: '1', desc: 'SMC Execution' },
        { label: 'M5', value: '5', desc: 'Order Block Entry' },
        { label: 'M15', value: '15', desc: 'Market Structure Shift' },
        { label: 'H1', value: '60', desc: 'Intraday Liquidity' },
        { label: 'H4', value: '240', desc: 'HTF Bias / Trend' },
    ];

    // 🔥 ម៉ាស៊ីនចាក់បង្កប់ TradingView Live Widget (Real-time XAUUSD Chart)
    useEffect(() => {
        if (!containerRef.current) return;

        // សម្អាត Widget ចាស់ចេញមុននឹងលោត Widget ថ្មីតាម Timeframe
        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;

        // ការកំណត់ Configuration ឱ្យត្រូវនឹងទម្រង់ Premium Cyberpunk Terminal
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: 'OANDA:XAUUSD', // ប្រើប្រភពទិន្នន័យមាសពិតៗល្បឿនលឿនពី OANDA
            interval: selectedTf,
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1', // Candle Chart
            locale: 'en',
            enable_publishing: false,
            hide_side_toolbar: false, // បើក Side toolbar ដើម្បីឱ្យបងងាយស្រួលគូស OB / FVG Boxes
            allow_symbol_change: false,
            calendar: false,
            studies: [
                'RSI@tv-basicstudies', // បន្ថែម Indicator ជំនួយ
                'MASimple@tv-basicstudies'
            ],
            container_id: 'tradingview_xau_chart',
            loading_screen: { backgroundColor: '#030712' } // ពណ៌ប្រផេះខ្មៅស្រទន់
        });

        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'tradingview_xau_chart';
        widgetContainer.className = 'w-full h-full';
        
        containerRef.current.appendChild(widgetContainer);
        containerRef.current.appendChild(script);

    }, [selectedTf]);

    return (
        <div className="min-h-screen text-gray-100 p-6 font-mono relative bg-gray-950">
            
            {/* 🎯 TOP CONTROLLER HUD */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/20 bg-gray-950/60 backdrop-blur-md p-4 rounded-xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.03)]">
                
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <Target className="h-5 w-5 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-amber-400 tracking-wider">XAU/USD SMC QUANTCORE</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">High-Frequency Scalping Terminal</p>
                    </div>
                </div>

                {/* ⏱️ TIMEFRAME SWITCH MATRIX */}
                <div className="flex bg-black/40 border border-gray-900 p-1 rounded-xl items-center gap-1">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => setSelectedTf(tf.value)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-300 flex flex-col items-center min-w-[70px] ${
                                selectedTf === tf.value
                                    ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'border border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <span>{tf.label}</span>
                            <span className="text-[8px] text-gray-600 font-normal tracking-tighter mt-0.5 uppercase">
                                {tf.desc.split(' ')[0]}
                            </span>
                        </button>
                    ))}
                </div>

            </div>

            {/* 🎛️ GRAPH & ANALYSIS MATRIX GRID */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 📊 REAL-TIME LIVE CHART CONTAINER (3 COLS) */}
                <div className="lg:col-span-3 h-[600px] rounded-xl overflow-hidden border border-emerald-500/20 bg-gray-950 relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-3 left-4 z-10 flex items-center gap-2 bg-gray-950/80 border border-gray-900 px-3 py-1.5 rounded-lg backdrop-blur-md">
                        <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold tracking-widest text-gray-300">LIVE FEED : XAUUSD</span>
                    </div>

                    {/* 🔄 ទីតាំងដែល TradingView Engine ចាក់បញ្ចូលកូដ */}
                    <div ref={containerRef} className="w-full h-full" />
                </div>

                {/* 📟 SMC MATRIX HUB (1 COL) */}
                <div className="flex flex-col justify-between h-[600px]">
                    
                    {/* RISK MANAGEMENT CHECKS */}
                    <div className="bg-gray-950/60 border border-emerald-500/10 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase border-b border-gray-900 pb-2">
                            <ShieldAlert className="h-4 w-4" />
                            <span>SMC Execution Rules</span>
                        </div>
                        
                        <div className="space-y-2 text-[11px] text-gray-400 font-mono">
                            <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-900">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span>Look for HTF Bias (H4/H1)</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-900">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span>Wait for MSS / BOS on M5</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-gray-900">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Identify Premium FVG Box</span>
                            </div>
                        </div>
                    </div>

                    {/* LIVE MATRIX STATUS */}
                    <div className="bg-gray-950/60 border border-emerald-500/20 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase">
                            <Cpu className="h-4 w-4 animate-spin [animation-duration:12s]" />
                            <span>Quantum Scalp Feed</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/40 border border-gray-900 p-3 rounded-lg text-center">
                                <span className="text-[9px] block text-gray-600 tracking-wider">SPREAD</span>
                                <span className="text-xs font-bold font-mono text-gray-300">0.2 Pips</span>
                            </div>
                            <div className="bg-black/40 border border-gray-900 p-3 rounded-lg text-center">
                                <span className="text-[9px] block text-gray-600 tracking-wider">SMC VOL</span>
                                <span className="text-xs font-bold font-mono text-emerald-400">HIGH</span>
                            </div>
                        </div>

                        <button className="w-full py-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 font-bold text-xs uppercase tracking-widest hover:from-amber-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                            Scan Liquidity Pools
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}