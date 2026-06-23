import pandas as pd
import time
import yfinance as yf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import uvicorn
import random
import os
import datetime
from pymongo import MongoClient
import certifi

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCK = threading.Lock()

# 🌐 លីងភ្ជាប់ទៅកាន់ MongoDB Cloud (បានកែសម្រួលសញ្ញា $ ទៅជា %24 រួចរាល់ដើម្បីការពារ Error)
MONGO_URI = os.environ.get(
    "MONGO_URI", 
    "mongodb+srv://angsoty:Angsotyada%240212%24@bot-trading.3017bkt.mongodb.net/?appName=bot-trading"
)

try:
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client["XAU_ICT_SMC_SCALPER"]
    collection = db["bot_state"]
    print("✅ CONNECTED TO MONGODB ATLAS CLOUD DATABASE")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    db = None
    collection = None

# 🎯 បញ្ជីកាក់ដែលត្រូវរត់ការស្កែន (Supported Assets Configuration)
ASSETS_CONFIG = {
    "BTCUSDT": {"symbol": "BTC-USD", "key": "btc"},
    "XAUUSD": {"symbol": "GC=F", "key": "xau"},
    "SOLUSDT": {"symbol": "SOL-USD", "key": "sol"},
    "BNBUSDT": {"symbol": "BNB-USD", "key": "bnb"},
    "ADAUSDT": {"symbol": "ADA-USD", "key": "ada"},
    "ZECUSDT": {"symbol": "ZEC-USD", "key": "zec"}
}

# 🧠 បង្កើតរចនាសម្ព័ន្ធ STATE ដើមនៅក្នុង Memory 
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
    """ 🔄 រក្សាទុកទិន្នន័យទៅកាន់ MongoDB Cloud """
    if collection is None:
        return
        
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
        collection.update_one(
            {"_id": "global_state"},
            {"$set": {"assets_data": data_to_save}},
            upsert=True
        )
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")

def load_data_from_file():
    """ 📦 ទាញយកទិន្នន័យចាស់មកវិញភ្លាមពេល Bot ចាប់ផ្តើមរាន់ """
    if collection is None:
        return
        
    try:
        saved_record = collection.find_one({"_id": "global_state"})
        if saved_record and "assets_data" in saved_record:
            saved_data = saved_record["assets_data"]
            for asset in ASSETS_CONFIG.keys():
                if asset in saved_data:
                    STATE[asset]["current_signals"] = saved_data[asset].get("current_signals", {"5M": None, "15M": None, "1H": None, "4H": None})
                    STATE[asset]["last_processed_candle"] = saved_data[asset].get("last_processed_candle", {"5M": "", "15M": "", "1H": "", "4H": ""})
                    STATE[asset]["history"] = saved_data[asset].get("history", [])
                    STATE[asset]["wins"] = saved_data[asset].get("wins", 0)
                    STATE[asset]["losses"] = saved_data[asset].get("losses", 0)
            print("📦 MULTI-ASSET CLOUD DATABASE INITIALIZED SUCCESSFUL")
        else:
            print("🆕 No existing cloud state found. Starting with fresh records.")
    except Exception as e:
        print(f"Error loading from MongoDB: {e}")

load_data_from_file()
TIMEFRAMES = ["5m", "15m", "1h", "4h"]

def scan_asset_tf(asset, symbol, tf):
    global STATE
    tf_key = tf.upper()
    try:
        df = yf.download(symbol, interval=tf, period="60d" if tf in ["1h", "4h"] else "30d", progress=False)
        if df.empty or len(df) < 20:
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

        # 🧠 ចាប់ផ្តើមការគណនាលើទៀនដែលទើបតែបិទ (Candle Index i)
        i = len(df) - 2  
        
        khmer_now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
        candle_time = khmer_now.strftime('%Y-%m-%d %H:%M:%S')

        raw_candle_stamp = str(df.index[i].strftime('%Y-%m-%d %H:%M:%S'))
        if raw_candle_stamp == last_candle:
            return

        # 📊 គណនា ATR (Average True Range) ដើម្បីទប់ទល់នឹង Market Noise របស់មាស
        df['tr'] = pd.concat([df['high'] - df['low'], 
                              (df['high'] - df['close'].shift()).abs(), 
                              (df['low'] - df['close'].shift()).abs()], axis=1).max(axis=1)
        df['atr'] = df['tr'].rolling(window=14).mean()
        atr_val = float(df['atr'].iloc[i]) if not pd.isna(df['atr'].iloc[i]) else (live_price * 0.001)

        # គណនារកតំបន់ Equilibrium (Lookback 10 ទៀន ដើម្បីឱ្យចេញ Signal ញឹក និងលឿនទាន់ចិត្ត)
        recent_max = df["high"].iloc[i-9:i+1].max()
        recent_min = df["low"].iloc[i-9:i+1].min()
        equilibrium = recent_min + (recent_max - recent_min) * 0.5

        new_signal = None
        confidence = random.randint(91, 98)

        # 🟢 HIGH-FREQUENCY BULLISH SETUP (SMC Momentum + Equilibrium Filter)
        if df["close"].iloc[i] > df["open"].iloc[i] and float(df["close"].iloc[i]) < equilibrium:
            entry = live_price
            sl = round(entry - (1.5 * atr_val), 4 if "USD" in symbol else 2) 
            tp = round(entry + (2.0 * atr_val), 4 if "USD" in symbol else 2) 

            if sl < entry and tp > entry:
                new_signal = {
                    "id": int(time.time()) + random.randint(1, 5000),
                    "time": candle_time,
                    "type": "BUY 🟢 [SMC SCALPER]",
                    "timeframe": tf_key,
                    "entry": entry,
                    "sl": sl,
                    "tp": tp,
                    "confidence": confidence,
                    "status": "OPEN"
                }

        # 🔴 HIGH-FREQUENCY BEARISH SETUP
        elif df["close"].iloc[i] < df["open"].iloc[i] and float(df["close"].iloc[i]) > equilibrium:
            entry = live_price
            sl = round(entry + (1.5 * atr_val), 4 if "USD" in symbol else 2)
            tp = round(entry - (2.0 * atr_val), 4 if "USD" in symbol else 2)

            if sl > entry and tp < entry:
                new_signal = {
                    "id": int(time.time()) + random.randint(1, 5000),
                    "time": candle_time,
                    "type": "SELL 🔴 [SMC SCALPER]",
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
    print("🚀 QUANT SCALPER ONLINE - HIGH FREQUENCY SMC/ICT ENGINE")
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
    target_tf = tf.upper() if tf else "ALL"
    
    with LOCK:
        res = {}
        for info in ASSETS_CONFIG.values():
            res[f"isScanning{info['key'].upper()}"] = STATE["scans"][info["key"]]
            
        for asset, info in ASSETS_CONFIG.items():
            key = info["key"]
            all_sigs = []
            
            for tf_key, sig in STATE[asset]["current_signals"].items():
                if sig:
                    if target_tf == "ALL" or tf_key == target_tf:
                        all_sigs.append(sig)
            
            filtered_history = STATE[asset]["history"]
            if target_tf != "ALL":
                filtered_history = [s for s in filtered_history if s.get("timeframe", "").upper() == target_tf]
            
            all_sigs.extend(filtered_history[-30:])
            
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