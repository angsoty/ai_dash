import { TickerTape } from '../components/market/TickerTape';
import { TradingChart } from '../components/chart/TradingChart';
import { SignalPanel } from '../components/signals/SignalPanel';
import { ShieldCheck, Activity, Database, Key } from 'lucide-react';

export function Dashboard() {
    const stats = [
        { label: 'AI WIN RATE', val: '78.51%', desc: 'SMC/ICT Confluence', icon: ShieldCheck, color: 'text-green-400' },
        { label: 'REDIS CHANNEL', val: 'market:stream', desc: 'Pub/Sub Stream', icon: Database, color: 'text-blue-400' },
        { label: 'BROADCASTER', val: 'Port 8085', desc: 'Laravel Reverb', icon: Activity, color: 'text-purple-400' }
    ];

    return (
        <div className="space-y-6">
            <TickerTape />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex justify-between items-center shadow-lg">
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">{stat.label}</span>
                                <h3 className="text-2xl font-black font-mono text-white">{stat.val}</h3>
                                <p className="text-xs text-gray-400">{stat.desc}</p>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl">
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TradingChart />
                </div>
                <div>
                    <SignalPanel />
                </div>
            </div>
        </div>
    );
}