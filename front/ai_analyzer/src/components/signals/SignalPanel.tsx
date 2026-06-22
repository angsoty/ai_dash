import { useEffect, useRef, useState } from 'react';
import echo from '../../utils/echo';
import toast from 'toastr';
import 'toastr/build/toastr.min.css';
import { Target, Zap } from 'lucide-react';

interface Signal {
    id: number;
    symbol: string;
    timeframe: string;
    current_price: number;
    liquidity_type: string;
}

export function SignalPanel() {

    const [signals, setSignals] = useState<Signal[]>([]);
    const seenIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        console.log("📡 Listening to Reverb Live Direct Feed...");

        const channel = echo.channel('smc-ict-matrix')
            .listen('SmcSetupDetected', (data: any) => {

                const signalId = data.id ?? Math.floor(Math.random() * 100000);

                // 🚨 prevent duplicate signals (IMPORTANT FIX)
                if (seenIds.current.has(signalId)) return;
                seenIds.current.add(signalId);

                const newSignal: Signal = {
                    id: signalId,
                    symbol: data.symbol ?? 'UNKNOWN',
                    timeframe: data.timeframe ?? 'M15',
                    current_price: data.current_price ?? 0,
                    liquidity_type: data.liquidity_type ?? 'HIGH_PROBABILITY'
                };

                // keep only latest 20 signals (prevents lag)
                setSignals(prev => [newSignal, ...prev].slice(0, 20));

                toast.success(
                    `AI Signal: ${newSignal.symbol} | ${newSignal.liquidity_type}`
                );
            });

        return () => {
            echo.leaveChannel('smc-ict-matrix');
        };
    }, []);

    return (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex flex-col h-[480px] shadow-lg">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-900 pb-3">

                <div className="flex items-center gap-2.5">
                    <Target className="h-4 w-4 text-red-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                        SMC/ICT Confluence Feed
                    </h2>
                </div>

                <span className="text-[10px] bg-red-500/10 text-red-400 font-mono border border-red-500/20 px-2 py-0.5 rounded font-bold animate-pulse">
                    REVERB LIVE
                </span>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">

                {signals.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">

                        <Zap className="h-8 w-8 text-gray-700 mb-2 animate-pulse" />

                        <p className="text-xs font-mono">
                            Waiting for AI market signals...
                        </p>

                        <p className="text-[10px] text-gray-600 mt-1">
                            WebSocket connected → Laravel Reverb
                        </p>
                    </div>

                ) : (
                    signals.map((signal) => (
                        <div
                            key={signal.id}
                            className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex justify-between items-center hover:border-emerald-500/30 transition-all duration-200"
                        >

                            {/* LEFT */}
                            <div className="space-y-1">

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white font-mono">
                                        {signal.symbol}
                                    </span>

                                    <span className="text-[10px] font-mono bg-gray-950 px-2 py-0.5 border border-gray-800 rounded text-gray-400">
                                        {signal.timeframe}
                                    </span>
                                </div>

                                <div className="text-xs font-mono text-gray-400">
                                    Price: <span className="text-white">
                                        ${signal.current_price}
                                    </span>
                                </div>

                            </div>

                            {/* RIGHT */}
                            <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/30 text-green-400 rounded-lg text-xs font-mono font-bold uppercase">
                                {signal.liquidity_type}
                            </span>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}