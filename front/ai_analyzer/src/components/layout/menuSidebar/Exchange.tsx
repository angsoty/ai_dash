import { useState, useEffect, useRef } from "react";

type SignalData = {
    id: number;
    time: string;
    type: string;
    timeframe: string;
    entry: number;
    sl: number;
    tp: number;
    confidence?: number;
    status: string;
};

// 🎯 បញ្ជីកាក់ដែលត្រូវបង្ហាញលើប៊ូតុងជ្រើសរើស (Supported Coins Mapping)
const SUPPORTED_ASSETS = [
    { key: "btc", label: "₿ BTCUSDT", tvSymbol: "BINANCE:BTCUSDT" },
    { key: "xau", label: "📿 XAUUSD (GOLD)", tvSymbol: "FX:XAUUSD" },
    { key: "sol", label: "☀️ SOLUSDT", tvSymbol: "BINANCE:SOLUSDT" },
    { key: "bnb", label: "🔶 BNBUSDT", tvSymbol: "BINANCE:BNBUSDT" },
    { key: "ada", label: "🔹 ADAUSDT", tvSymbol: "BINANCE:ADAUSDT" },
    { key: "zec", label: "🛡️ ZECUSDT", tvSymbol: "BINANCE:ZECUSDT" },
] as const;

type AssetKey = typeof SUPPORTED_ASSETS[number]["key"];

export function Exchange() {
    const [winRate, setWinRate] = useState(0.00);
    const [totalTrades, setTotalTrades] = useState(0);
    const [statWins, setStatWins] = useState(0);
    const [statLosses, setStatLosses] = useState(0);

    const [signals, setSignals] = useState<SignalData[]>([]);
    
    // 🔘 រក្សាទុកស្ថានភាពប៊ូតុងស្កែនទាំងអស់នៅក្នុង Object តែមួយ (Dynamic Scans State)
    const [scans, setScans] = useState<Record<string, boolean>>({
        btc: false, xau: false, sol: false, bnb: false, ada: false, zec: false
    });

    const [asset, setAsset] = useState<AssetKey>("xau");
    const [price, setPrice] = useState<number>(0);
    const [selectedTF, setSelectedTF] = useState<"ALL" | "5M" | "15M" | "1H" | "4H">("ALL");

    const containerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const API = "http://127.0.0.1:8000/api";

    const fetchSignals = async (currentAsset = asset) => {
        try {
            const res = await fetch(`${API}/signals`);
            if (!res.ok) throw new Error("Offline");
            const data = await res.json();

            // ទាញយកស្ថានភាពប៊ុងតុងស្កែនទាំងអស់មកបច្ចុប្បន្នភាពលើ UI
            setScans({
                btc: data.isScanningBTC,
                xau: data.isScanningXAU,
                sol: data.isScanningSOL,
                bnb: data.isScanningBNB,
                ada: data.isScanningADA,
                zec: data.isScanningZEC
            });

            // ចាប់យកទិន្នន័យកាក់ចរន្តពី Backend Dynamic Key (btc, xau, sol, ...)
            const selected = data[currentAsset];

            if (selected) {
                setSignals(selected.signals || []);
                setPrice(selected.price || 0);
                setTotalTrades(selected.totalTrades || 0);
                setWinRate(selected.winRate || 0.00);
                setStatWins(selected.wins || 0);
                setStatLosses(selected.losses || 0);
            }
        } catch (err) {
            console.log("Backend connection offline...");
        }
    };

    useEffect(() => {
        fetchSignals(asset);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => fetchSignals(asset), 2000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [asset]);

    // ⚡ មុខងារចុចប៊ូតុង Toggle Scan ដាច់ដោយឡែកពីគ្នាពិតប្រាកដ
    const handleToggleScan = async () => {
        try {
            const res = await fetch(`${API}/toggle-scan/${asset}`, { method: "POST" });
            const data = await res.json();
            
            const responseKey = `isScanning${asset.toUpperCase()}`;
            setScans(prev => ({
                ...prev,
                [asset]: data[responseKey]
            }));

            setTimeout(() => fetchSignals(asset), 200);
        } catch {
            alert("Backend Connection Refused");
        }
    };

    // 📈 រៀបចំ TradingView Widget - កែសម្រួលប្រព័ន្ធម៉ោង និងរបារឧបករណ៍ដូរ Timeframe
    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        const id = "tv_chart";

        const div = document.createElement("div");
        div.id = id; div.style.width = "100%"; div.style.height = "100%";
        containerRef.current.appendChild(div);

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            if (window.TradingView) {
                const currentConfig = SUPPORTED_ASSETS.find(a => a.key === asset);
                new window.TradingView.widget({
                    autosize: true,
                    symbol: currentConfig ? currentConfig.tvSymbol : "BINANCE:BTCUSD",
                    interval: "15",               // ម៉ោងលំនាំដើមពេលទើបបើកទំព័រដំបូង
                    timezone: "Asia/Jakarta",      // 🇰🇭 ប្រើប្រាស់ល្វែងម៉ោង GMT+7 ដែល Widget ស្គាល់ផ្លូវការ
                    theme: "dark",
                    style: "1",
                    locale: "en",
                    container_id: id,
                    hide_top_toolbar: false,      // 🔥 បើករបារឧបករណ៍ខាងលើ ដើម្បីបង្ហាញប៊ូតុងដូរ Timeframe សេរី
                    hide_side_toolbar: false,     // បើករបារឧបករណ៍ឆ្វេងសម្រាប់គូរគំនូសបច្ចេកទេស
                    allow_symbol_change: true,    // អនុញ្ញាតឱ្យផ្លាស់ប្តូរគូកាក់នៅលើ Widget បាន
                    enable_publishing: false,
                    withdateranges: true,         // បើកទិន្នន័យ Range ម៉ោងតាមតំបន់
                    hide_ideas: true,
                    data_status: "streaming"      // បង្ខំឱ្យវាជម្រុញទិន្នន័យ Live តាមម៉ោងពិត
                });
            }
        };
        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = "";
        };
    }, [asset]);

    const filteredSignals = signals.filter((s) => {
        if (selectedTF === "ALL") return true;
        return s.timeframe === selectedTF;
    });

    const isCurrentAssetScanning = scans[asset] || false;
    const decimalPlaces = asset === "ada" ? 4 : 2;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 font-mono">
            {/* HEADER WITH COIN TABS */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center mb-4 border-b border-gray-800 pb-3">
                <div className="flex flex-wrap gap-2">
                    {SUPPORTED_ASSETS.map((coin) => (
                        <button
                            key={coin.key}
                            onClick={() => setAsset(coin.key)}
                            className={`px-3 py-1.5 text-xs font-bold rounded border transition-all ${
                                asset === coin.key 
                                    ? "bg-indigo-500/20 border-indigo-400 text-indigo-300" 
                                    : "border-gray-800 text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            {coin.label} {scans[coin.key] && "•"}
                        </button>
                    ))}
                </div>

                {/* REAL-TIME STATS DISPLAY */}
                <div className="flex items-center justify-between gap-6 px-6 py-1 bg-black/40 rounded-lg border border-gray-900">
                    <div className="text-left">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">{asset.toUpperCase()} Live Market</div>
                        <div className="text-xl text-emerald-400 font-bold">
                            ${price > 0 ? price.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces }) : "0.00"}
                        </div>
                    </div>
                    <div className="text-right border-l border-gray-800 pl-4">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Verified WR</div>
                        <div className="text-sm text-yellow-400 font-bold">{winRate.toFixed(2)}%</div>
                    </div>
                </div>

                <button
                    onClick={handleToggleScan}
                    className={`px-5 py-1.5 text-xs font-bold rounded border transition-all ${
                        isCurrentAssetScanning ? "border-red-500 text-red-400 bg-red-500/10" : "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                    }`}
                >
                    {isCurrentAssetScanning ? `🛑 STOP ${asset.toUpperCase()} SCALPER` : `⚡ START ${asset.toUpperCase()} SCALPER`}
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 border border-gray-800 rounded-xl overflow-hidden bg-black" style={{ height: "80vh" }}>
                    <div ref={containerRef} className="w-full h-full" />
                </div>

                {/* SIGNALS SIDEBAR */}
                <div className="border border-gray-800 rounded-xl flex flex-col bg-black/20" style={{ height: "80vh" }}>
                    <div className="p-3 border-b border-gray-800 bg-black/40 text-[11px] space-y-1.5">
                        <div className="font-bold text-[12.5px] text-gray-300 flex justify-between">
                            <span>📊 Bot Signal Monitor</span>
                            <span className="text-blue-400">Total: {totalTrades}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center font-bold text-[10px] bg-black/40 p-1.5 rounded border border-gray-900">
                            <div className="text-green-400">✅ TP: {statWins}</div>
                            <div className="text-red-400">❌ SL: {statLosses}</div>
                            <div className="text-yellow-400">🎯 WR: {winRate.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* TIMEFRAME SELECTOR TABS */}
                    <div className="grid grid-cols-5 gap-1 p-2 bg-black/60 border-b border-gray-900 text-[10px] font-bold">
                        {(["ALL", "5M", "15M", "1H", "4H"] as const).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setSelectedTF(tf)}
                                className={`py-1 rounded text-center transition-all border ${
                                    selectedTF === tf ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow" : "bg-transparent border-transparent text-gray-500"
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    {/* SIGNALS LIST */}
                    <div className="p-3 overflow-y-auto space-y-3 flex-1">
                        {filteredSignals.length === 0 ? (
                            <div className="text-gray-600 text-xs text-center mt-10 animate-pulse">
                                No active setups on {selectedTF} loop...
                            </div>
                        ) : (
                            filteredSignals.map((s) => (
                                <div
                                    key={s.id}
                                    className={`p-3 border rounded bg-black/40 transition-all ${
                                        s.status === "OPEN" ? "border-purple-500 animate-pulse" : s.type.includes("BUY") ? "border-green-950/70" : "border-red-950/70"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`font-bold text-xs ${s.type.includes("BUY") ? "text-green-400" : "text-red-400"}`}>
                                            {s.type} {s.status === "OPEN" && "• LIVE"}
                                        </span>
                                        <span className="text-[9px] bg-blue-950 border border-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                                            {s.timeframe}
                                        </span>
                                    </div>

                                    <div className="text-[9px] text-gray-500 mt-1">🕒 Release Time: {s.time}</div>

                                    <div className="grid grid-cols-3 gap-1 text-[11px] mt-2.5 bg-black/60 p-2 rounded border border-gray-900">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500">ENTRY</span>
                                            <span className="text-gray-300 font-bold">{s.entry ? Number(s.entry).toFixed(decimalPlaces) : "0.00"}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500">STOP LOSS</span>
                                            <span className="text-red-400 font-bold">{s.sl ? Number(s.sl).toFixed(decimalPlaces) : "0.00"}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-500">TARGET</span>
                                            <span className="text-green-400 font-bold">{s.tp ? Number(s.tp).toFixed(decimalPlaces) : "0.00"}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-900/60 text-[10px]">
                                        <span className="text-yellow-500/80">Conf: {s.confidence}%</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            s.status === "TP" ? "bg-green-500/20 text-green-400" : s.status === "SL" ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
                                        }`}>
                                            {s.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

declare global {
    interface Window { TradingView: any; }
}