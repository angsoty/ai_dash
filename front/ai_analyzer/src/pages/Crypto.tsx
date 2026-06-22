import { Info, TrendingUp, Activity, BarChart3 } from 'lucide-react';

export function Crypto() {
    return (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-[520px] flex flex-col shadow-lg">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-4">

                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                        Exchange Terminal
                    </h2>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-green-500/30 bg-green-500/10 text-green-400 animate-pulse">
                    MARKET LIVE
                </span>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">

                <div className="bg-gray-900 border border-gray-800 p-4 rounded-full mb-4">
                    <Info className="h-6 w-6 text-green-400" />
                </div>

                <h2 className="text-lg font-bold text-white mb-1">
                    Crypto & Asset Terminal
                </h2>

                <p className="text-xs font-mono text-gray-500 max-w-md leading-relaxed">
                    Spot trading interface for BTC, ETH, SOL, and XAU with real-time order flow, liquidity tracking, and AI market signals.
                </p>

                {/* MODULE CARDS */}
                <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md">

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
                        <p className="text-[10px] font-mono text-gray-400">SPOT PRICE</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <Activity className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-[10px] font-mono text-gray-400">ORDER FLOW</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <BarChart3 className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                        <p className="text-[10px] font-mono text-gray-400">LIQUIDITY</p>
                    </div>

                </div>

                {/* FOOTER PIPELINE */}
                <div className="mt-6 text-[10px] font-mono text-gray-600">
                    CONNECTING → Binance API → Laravel Engine → AI Signal Processor
                </div>

            </div>
        </div>
    );
}