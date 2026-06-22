import pandas as pd
import time
import yfinance as yf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import uvicorn
import random
import json
import os
import datetime  # 🕒 បន្ថែមសម្រាប់ចាប់ម៉ោង Live ស្រុកខ្មែរ

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCK = threading.Lock()
DB_FILE = "trading_database.json"

# 🎯 បញ្ជីកាក់ដែលត្រូវរត់ការស្កែន (Supported Assets Configuration)
ASSETS_CONFIG = {
    "BTCUSDT": {"symbol": "BTC-USD", "key": "btc"},
    "XAUUSD": {"symbol": "GC=F", "key": "xau"},
    "SOLUSDT": {"symbol": "SOL-USD", "key": "sol"},
    "BNBUSDT": {"symbol": "BNB-USD", "key": "bnb"},
    "ADAUSDT": {"symbol": "ADA-USD", "key": "ada"},
    "ZECUSDT": {"symbol": "ZEC-USD", "key": "zec"}
}

# 🧠 បង្កើតគ្រោងរចនាសម្ព័ន្ធទិន្នន័យដំបូងស្វ័យប្រវត្ត (Automated State Initialization)
STATE = {
    "scans": {info["key"]: False for info in ASSETS_CONFIG.values()}
}

for asset, info in ASSETS_CONFIG.items():
    STATE[asset] = {
        "price": 0.0,
        "current_signals": {"5M": None, "15M": None, "1H": None, "4H": None},
        "last_processed_candle": {"5M": "", "15M": "", "1H": "", "4H": ""},
        "history": [],
        "wins": 0,
        "losses": 0
    }

def save_data_to_file():
    with LOCK:
        data_to_save = {}
        for asset in ASSETS_CONFIG.keys():
            data_to_save[asset] = {
                "current_signals": STATE[asset]["current_signals"],
                "last_processed_candle": STATE[asset]["last_processed_candle"],
                "history": STATE[asset]["history"],
                "wins": STATE[asset]["wins"],
                "losses": STATE[asset]["losses"]
            }
    try:
        with open(DB_FILE, "w") as f:
            json.dump(data_to_save, f, indent=4)
    except Exception as e:
        print(f"Error saving database: {e}")

def load_data_from_file():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                saved_data = json.load(f)
                for asset in ASSETS_CONFIG.keys():
                    if asset in saved_data:
                        STATE[asset]["current_signals"] = saved_data[asset].get("current_signals", {"5M": None, "15M": None, "1H": None, "4H": None})
                        STATE[asset]["last_processed_candle"] = saved_data[asset].get("last_processed_candle", {"5M": "", "15M": "", "1H": "", "4H": ""})
                        STATE[asset]["history"] = saved_data[asset].get("history", [])
                        STATE[asset]["wins"] = saved_data[asset].get("wins", 0)
                        STATE[asset]["losses"] = saved_data[asset].get("losses", 0)
            print("📦 MULTI-ASSET SMC DATABASE INITIALIZED SUCCESSFUL")
        except Exception as e:
            print(f"Error loading database: {e}")

load_data_from_file()
TIMEFRAMES = ["5m", "15m", "1h", "4h"]

def scan_asset_tf(asset, symbol, tf):
    global STATE
    tf_key = tf.upper()
    try:
        df = yf.download(symbol, interval=tf, period="60d" if tf in ["1h", "4h"] else "30d", progress=False)
        if df.empty or len(df) < 15:
            return

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]
        df.columns = [c.lower() for c in df.columns]

        # 🕒 បំប្លែងម៉ោងក្រាហ្វឱ្យទៅជា ម៉ោងកម្ពុជា (GMT+7)
        if df.index.tz is None:
            df.index = df.index.tz_localize('UTC').tz_convert('Asia/Phnom_Penh')
        else:
            df.index = df.index.tz_convert('Asia/Phnom_Penh')

        live_price = float(df["close"].iloc[-1])
        candle_high = float(df["high"].iloc[-1])
        candle_low = float(df["low"].iloc[-1])
        
        with LOCK:
            STATE[asset]["price"] = live_price
            active_sig = STATE[asset]["current_signals"].get(tf_key)
            last_candle = STATE[asset]["last_processed_candle"].get(tf_key, "")

        # ឆែកលក្ខខណ្ឌ Position កំពុងរត់ (Live Position Monitor)
        if active_sig:
            is_closed = False
            status_result = "OPEN"
            tp_level = float(active_sig["tp"])
            sl_level = float(active_sig["sl"])
            
            if active_sig["type"].startswith("BUY"):
                if live_price >= tp_level or candle_high >= tp_level:
                    status_result = "TP"
                    is_closed = True
                elif live_price <= sl_level or candle_low <= sl_level:
                    status_result = "SL"
                    is_closed = True
            else: # SELL
                if live_price <= tp_level or candle_low <= tp_level:
                    status_result = "TP"
                    is_closed = True
                elif live_price >= sl_level or candle_high >= sl_level:
                    status_result = "SL"
                    is_closed = True

            if is_closed:
                with LOCK:
                    active_sig["status"] = status_result
                    STATE[asset]["history"].append(active_sig)
                    if status_result == "TP":
                        STATE[asset]["wins"] += 1
                    else:
                        STATE[asset]["losses"] += 1
                    STATE[asset]["current_signals"][tf_key] = None
                save_data_to_file()
            return

        # 🧠 ចាប់ផ្តើម SMC/ICT Logic លើទៀនដែលបិទរួចរាល់ (Candle Index i)
        i = len(df) - 2  
        
        khmer_now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
        candle_time = khmer_now.strftime('%Y-%m-%d %H:%M:%S')

        # បង្កើត Check ID ផ្អែកលើ Index ដើមដើម្បីការពារការ Repeat ទាញទិន្នន័យដដែលៗក្នុងទៀនមួយ
        raw_candle_stamp = str(df.index[i].strftime('%Y-%m-%d %H:%M:%S'))
        if raw_candle_stamp == last_candle:
            return

        # គណនារកតំបន់ Premium / Discount Zone Array (15 Candles Lookback)
        recent_max = df["high"].iloc[i-14:i+1].max()
        recent_min = df["low"].iloc[i-14:i+1].min()
        equilibrium = recent_min + (recent_max - recent_min) * 0.5

        new_signal = None
        confidence = random.randint(89, 98)

        # 🟢 BULLISH SMC SETUP (Discount Zone + FVG)
        if df["low"].iloc[i] > df["high"].iloc[i-2]:  
            fvg_top = float(df["low"].iloc[i])
            fvg_bottom = float(df["high"].iloc[i-2])
            c_close = float(df["close"].iloc[i])
            
            if c_close < equilibrium:
                entry = round((fvg_top + fvg_bottom) / 2, 4 if "USD" in symbol else 2)
                sl = round(float(df["low"].iloc[i-2]), 4 if "USD" in symbol else 2)     
                if entry <= sl: entry = c_close
                tp = round(entry + (entry - sl) * 2.0, 4 if "USD" in symbol else 2)     

                new_signal = {
                    "id": int(time.time()) + random.randint(1, 5000),
                    "time": candle_time,  # 🕒 ម៉ោងស្រុកខ្មែរ Real-time Release
                    "type": "BUY 🟢 [SMC FVG]",
                    "timeframe": tf_key,
                    "entry": entry,
                    "sl": sl,
                    "tp": tp,
                    "confidence": confidence,
                    "status": "OPEN"
                }

        # 🔴 BEARISH SMC SETUP (Premium Zone + FVG)
        elif df["high"].iloc[i] < df["low"].iloc[i-2]:  
            fvg_top = float(df["low"].iloc[i-2])
            fvg_bottom = float(df["high"].iloc[i])
            c_close = float(df["close"].iloc[i])
            
            if c_close > equilibrium:
                entry = round((fvg_top + fvg_bottom) / 2, 4 if "USD" in symbol else 2)
                sl = round(float(df["high"].iloc[i-2]), 4 if "USD" in symbol else 2)     
                if entry >= sl: entry = c_close
                tp = round(entry - (sl - entry) * 2.0, 4 if "USD" in symbol else 2)     

                new_signal = {
                    "id": int(time.time()) + random.randint(1, 5000),
                    "time": candle_time,  # 🕒 ម៉ោងស្រុកខ្មែរ Real-time Release
                    "type": "SELL 🔴 [SMC FVG]",
                    "timeframe": tf_key,
                    "entry": entry,
                    "sl": sl,
                    "tp": tp,
                    "confidence": confidence,
                    "status": "OPEN"
                }

        if new_signal:
            with LOCK:
                STATE[asset]["current_signals"][tf_key] = new_signal
                STATE[asset]["last_processed_candle"][tf_key] = raw_candle_stamp
            save_data_to_file()

    except Exception as e:
        print(f"Error in engine execution: {e}")

def engine_loop():
    print("🚀 QUANT SCALPER ONLINE - SCROLLING ALL ALTS WITH SMC ENGINE")
    while True:
        for asset, info in ASSETS_CONFIG.items():
            with LOCK:
                is_active = STATE["scans"][info["key"]]
            
            if is_active:
                for tf in TIMEFRAMES:
                    scan_asset_tf(asset, info["symbol"], tf)
                    time.sleep(0.15)

        time.sleep(2)

threading.Thread(target=engine_loop, daemon=True).start()

@app.get("/api/signals")
def get_signals(tf: str = "ALL"):
    """
    🎯 បច្ចុប្បន្នភាព៖ ទទួលយកប៉ារ៉ាម៉ែត្រ `tf` (ឧទាហរណ៍៖ ?tf=1H) ដើម្បីចម្រាញ់ទិន្នន័យ
    បើបងរើសម៉ោងណា វានឹងបញ្ជូនទៅតែម៉ោងនោះប៉ុណ្ណោះ មិនលាយឡំឡើយ។
    """
    target_tf = tf.upper() if tf else "ALL"
    
    with LOCK:
        res = {}
        # ផ្ញើស្ថានភាពប៊ូតុងស្កែនធម្មតា
        for info in ASSETS_CONFIG.values():
            res[f"isScanning{info['key'].upper()}"] = STATE["scans"][info["key"]]
            
        for asset, info in ASSETS_CONFIG.items():
            key = info["key"]
            all_sigs = []
            
            # 1. ត្រងយក Current Signals តាម Timeframe ដែលបានជ្រើសរើស
            for tf_key, sig in STATE[asset]["current_signals"].items():
                if sig:
                    if target_tf == "ALL" or tf_key == target_tf:
                        all_sigs.append(sig)
            
            # 2. ត្រងយក History Signals តាម Timeframe ដែលបានជ្រើសរើស
            filtered_history = STATE[asset]["history"]
            if target_tf != "ALL":
                filtered_history = [s for s in filtered_history if s.get("timeframe", "").upper() == target_tf]
            
            # យកត្រឹម 30 setups ចុងក្រោយដែលចម្រាញ់រួច
            all_sigs.extend(filtered_history[-30:])
            
            # គណនា Win Rate ផ្អែកលើទិន្នន័យរួម ឬទិន្នន័យដែល Filter រួច (ក្នុងកូដនេះរក្សាការគណនារួមដើម្បីឱ្យដឹង WR សរុប)
            wins = STATE[asset]["wins"]
            losses = STATE[asset]["losses"]
            total = wins + losses
            wr = round((wins / total) * 100, 2) if total > 0 else 0.00

            res[key] = {
                "price": STATE[asset]["price"],
                "signals": all_sigs,
                "winRate": wr,
                "totalTrades": total,
                "wins": wins,
                "losses": losses
            }
        return res

@app.post("/api/toggle-scan/{asset_key}")
def toggle_asset(asset_key: str):
    target_key = asset_key.lower()
    with LOCK:
        for asset, info in ASSETS_CONFIG.items():
            if info["key"] == target_key:
                STATE["scans"][target_key] = not STATE["scans"][target_key]
                return {f"isScanning{target_key.upper()}": STATE["scans"][target_key]}
    return {"error": "Invalid asset key"}

@app.post("/api/clear-history/{asset_key}")
def clear_history_only(asset_key: str):
    target_key = asset_key.lower()
    global STATE
    with LOCK:
        for asset, info in ASSETS_CONFIG.items():
            if info["key"] == target_key:
                STATE[asset]["history"] = []
                STATE[asset]["wins"] = 0
                STATE[asset]["losses"] = 0
                save_data_to_file()
                return {"message": f"Successfully cleared history for {asset}"}
    return {"error": "Invalid asset key"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))

@app.get("/healthz")
def health():
    return {"status": "ok"}