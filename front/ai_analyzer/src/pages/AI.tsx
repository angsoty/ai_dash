import { Terminal, Activity, Cpu, Database } from 'lucide-react';

export function AI() {
    return (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-[520px] flex flex-col shadow-lg">

            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-4">

                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-purple-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">
                        AI Trading Core
                    </h2>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 animate-pulse">
                    PYTHON ENGINE
                </span>
            </div>

            {/* MAIN BODY */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">

                <div className="bg-gray-900 border border-gray-800 p-4 rounded-full mb-4">
                    <Cpu className="h-6 w-6 text-purple-400" />
                </div>

                <h2 className="text-lg font-bold text-white mb-1">
                    AI Trading Hub
                </h2>

                <p className="text-xs font-mono text-gray-500 max-w-md leading-relaxed">
                    Processing market structure, order blocks, liquidity zones, and FVG detection engine.
                </p>

                {/* STATUS GRID */}
                <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-md">

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <Activity className="h-4 w-4 text-green-400 mx-auto mb-1" />
                        <p className="text-[10px] font-mono text-gray-400">LIVE FEED</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <Database className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-[10px] font-mono text-gray-400">DATA STREAM</p>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <Terminal className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                        <p className="text-[10px] font-mono text-gray-400">AI CORE</p>
                    </div>

                </div>

                {/* FOOTER STATUS */}
                <div className="mt-6 text-[10px] font-mono text-gray-600">
                    CONNECTING → Laravel Reverb → Python AI Engine → Market Analyzer
                </div>

            </div>
        </div>
    );
}