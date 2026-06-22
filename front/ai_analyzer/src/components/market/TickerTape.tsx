import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Ticker = {
    pair: string;
    symbol: string;
    binanceSymbol: string;
    price: number;
    change: number;
    up: boolean;
};

export function TickerTape() {
    const [tickers, setTickers] = useState<Ticker[]>([
        { pair: 'BTC/USDT', symbol: 'btc', binanceSymbol: 'BTCUSDT', price: 0, change: 0, up: true },
        { pair: 'ETH/USDT', symbol: 'eth', binanceSymbol: 'ETHUSDT', price: 0, change: 0, up: true },
        { pair: 'SOL/USDT', symbol: 'sol', binanceSymbol: 'SOLUSDT', price: 0, change: 0, up: true },
        { pair: 'BNB/USDT', symbol: 'bnb', binanceSymbol: 'BNBUSDT', price: 0, change: 0, up: true },
        { pair: 'XRP/USDT', symbol: 'xrp', binanceSymbol: 'XRPUSDT', price: 0, change: 0, up: true },
    ]);

    const [apiIndex, setApiIndex] = useState(0);

    const binanceUrls = useCallback(() => [
        'https://api.binance.com',
        'https://api1.binance.com',
        'https://api2.binance.com'
    ], []);

    const fetchBinancePrices = useCallback(async () => {
        const base = binanceUrls()[apiIndex];

        try {
            const res = await fetch(`${base}/api/v3/ticker/24hr`);
            const data = await res.json();

            setTickers(prev =>
                prev.map(t => {
                    const m = data.find((x: any) => x.symbol === t.binanceSymbol);
                    if (!m) return t;

                    const change = parseFloat(m.priceChangePercent);

                    return {
                        ...t,
                        price: parseFloat(m.lastPrice),
                        change,
                        up: change >= 0
                    };
                })
            );

        } catch {
            setApiIndex(p => (p + 1) % binanceUrls().length);
        }
    }, [apiIndex, binanceUrls]);

    useEffect(() => {
        fetchBinancePrices();
        const i = setInterval(fetchBinancePrices, 4000);
        return () => clearInterval(i);
    }, [fetchBinancePrices]);

    return (
        <div className="relative overflow-hidden bg-gray-950 border border-gray-900 rounded-xl h-12 flex items-center">

            {/* LEFT BADGE */}
            <div className="absolute left-0 z-10 h-full px-4 flex items-center bg-gray-950 border-r border-gray-900">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
                <span className="text-[12px] font-mono text-white-400 tracking-widest">
                    LIVE MARKET
                </span>
            </div>

            {/* SCROLL AREA */}
            <div className="ml-28 flex w-max animate-marqueeSmooth">

                {[...tickers, ...tickers].map((t, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 px-5 whitespace-nowrap"
                    >
                        {/* ICON */}
                        <img
                            src={`https://cryptoicons.org/api/icon/${t.symbol}/32`}
                            className="w-4 h-4 rounded-full"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />

                        {/* PAIR */}
                        <span className="text-m text-yellow-400 font-mono">
                            {t.pair}
                        </span>

                        {/* PRICE */}
                        <span className="text-m text-white font-mono">
                            ${t.price.toFixed(2)}
                        </span>

                        {/* CHANGE */}
                        <span className={`text-[15px] flex items-center gap-1 ${
                            t.up ? 'text-emerald-400' : 'text-red-500'
                        }`}>
                            {t.up ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {t.change.toFixed(2)}%
                        </span>
                    </div>
                ))}

            </div>
        </div>
    );
}