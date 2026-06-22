import { BarChart3, Maximize2, Activity } from 'lucide-react';

export function TradingChart() {
    return (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex flex-col h-[520px] shadow-lg relative group overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4 border-b border-gray-900 pb-3">

                <div className="flex items-center gap-3">
                    <BarChart3 className="h-4 w-4 text-green-400" />

                    <h2 className="text-sm font-bold text-white tracking-wide">
                        AI Market Terminal
                    </h2>

                    <span className="px-2 py-0.5 bg-gray-900 text-[10px] font-mono text-gray-400 border border-gray-800 rounded">
                        LIVE CHART CORE
                    </span>
                </div>

                <button className="text-gray-500 hover:text-white transition-colors">
                    <Maximize2 className="h-4 w-4" />
                </button>
            </div>

            {/* STATUS BAR */}
            <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-gray-500">

                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-green-400 animate-pulse" />
                    <span>REAL-TIME DATA STREAM</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-green-400">M15</span>
                    <span className="text-gray-600">•</span>
                    <span>BTC / ETH / XAU READY</span>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="flex-1 relative rounded-xl border border-gray-900 bg-gradient-to-b from-gray-900/40 to-gray-950 overflow-hidden">

                {/* GRID BACKGROUND */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:18px_18px] opacity-20"></div>

                {/* CENTER MESSAGE */}
                <div className="absolute inset-0 flex items-center justify-center">

                    <div className="bg-gray-950/80 border border-gray-800 p-5 rounded-xl backdrop-blur-md text-center max-w-md">

                        <p className="text-xs font-mono text-gray-400 leading-relaxed">
                            Ready for <span className="text-green-400">TradingView Lightweight Charts</span>
                        </p>

                        <p className="mt-2 text-[11px] text-gray-600">
                            Connect AI Trading Engine → WebSocket → Live Market Feed
                        </p>

                        <div className="mt-4 flex justify-center gap-2 text-[10px] font-mono text-gray-500">
                            <span className="px-2 py-1 border border-gray-800 rounded">BTC</span>
                            <span className="px-2 py-1 border border-gray-800 rounded">ETH</span>
                            <span className="px-2 py-1 border border-gray-800 rounded">XAU</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}