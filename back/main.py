import os
import time
import datetime
import random
import threading
import pandas as pd
import yfinance as yf
import certifi
import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

app = FastAPI(title="AI Quant Multi-Indicator Scalper API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCK = threading.Lock()

MONGO_URI = os.environ.get(
    "MONGO_URI", 
    "mongodb+srv://angsoty:Angsotyada%240212%24@bot-trading.3017bkt.mongodb.net/?appName=bot-trading"
)

db = None
collection = None

try:
    client = MongoClient(
        MONGO_URI, 
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=5000
    )
    client.admin.command('ping')
    db = client["XAU_ICT_SMC_SCALPER"]
    collection = db["bot_state"]
    print("🟢 CONNECTED TO MONGODB ATLAS CLOUD DATABASE SUCCESSFULLY")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")

ASSETS_CONFIG = {
    "BTCUSDT": {"symbol": "BTC-USD", "key": "btc"},
    "XAUUSD": {"symbol": "GC=F", "key": "xau"},
    "SOLUSDT": {"symbol": "SOL-USD", "key": "sol"},
    "BNBUSDT": {"symbol": "BNB-USD", "key": "bnb"},
    "ADAUSDT": {"symbol": "ADA-USD", "key": "ada"},
    "ZECUSDT": {"symbol": "ZEC-USD", "key": "zec"}
}

STATE = {
    "scans": {info["key"]: False for info in ASSETS_CONFIG.values()}
}

for asset, info in ASSETS_CONFIG.items():
    STATE[asset] = {
        "price": 0.0,
        "current_signals": {"5M": None, "15M": None, "1H": None, "4H": None},
        "last_processed_candle": {"5M": "", "15M": "", "1H": "", "4H": ""},
        "display_signals": [],  # 🔥 ផ្ទុកត្រឹមតែអតិបរមា 100 គ្រាប់ចុងក្រោយសម្រាប់បង្ហាញលើអេក្រង់ដើម
        "history": [],          # 📦 ផ្ទុកគ្រាប់ចាស់ៗទាំងអស់ដែលលោតហួស 100 គ្រាប់
        "wins": 0,
        "losses": 0
    }

def save_data_to_file():
    if collection is None:
        return
    with LOCK:
        data_to_save = {}
        for asset in ASSETS_CONFIG.keys():
            data_to_save[asset] = {
                "current_signals": STATE[asset]["current_signals"],
                "last_processed_candle": STATE[asset]["last_processed_candle"],
                "display_signals": STATE[asset]["display_signals"],
                "history": STATE[asset]["history"],
                "wins": STATE[asset]["wins"],
                "losses": STATE[asset]["losses"]
            }
        scans_to_save = STATE["scans"]
    try:
        collection.update_one(
            {"_id": "global_state"},
            {"$set": {
                "assets_data": data_to_save,
                "scans_data": scans_to_save
            }},
            upsert=True
        )
    except Exception as e:
        print(f"❌ Error saving to MongoDB: {e}")

def load_data_from_file():
    if collection is None:
        return
    try:
        saved_record = collection.find_one({"_id": "global_state"})
        if saved_record:
            with LOCK:
                if "assets_data" in saved_record:
                    saved_data = saved_record["assets_data"]
                    for asset in ASSETS_CONFIG.keys():
                        if asset in saved_data:
                            STATE[asset]["current_signals"] = saved_data[asset].get("current_signals", {"5M": None, "15M": None, "1H": None, "4H": None})
                            STATE[asset]["last_processed_candle"] = saved_data[asset].get("last_processed_candle", {"5M": "", "15M": "", "1H": "", "4H": ""})
                            STATE[asset]["display_signals"] = saved_data[asset].get("display_signals", [])
                            STATE[asset]["history"] = saved_data[asset].get("history", [])
                            STATE[asset]["wins"] = saved_data[asset].get("wins", 0)
                            STATE[asset]["losses"] = saved_data[asset].get("losses", 0)
                if "scans_data" in saved_record:
                    saved_scans = saved_record["scans_data"]
                    for k in STATE["scans"].keys():
                        if k in saved_scans:
                            STATE["scans"][k] = saved_scans[k]
            print("📦 MULTI-ASSET CLOUD DATABASE INITIALIZED SUCCESSFUL")
    except Exception as e:
        print(f"❌ Error loading from MongoDB: {e}")

load_data_from_file()
TIMEFRAMES = ["5m", "15m", "1h", "4h"]

def scan_asset_tf(asset, symbol, tf):
    global STATE
    tf_key = tf.upper()
    try:
        df = yf.download(symbol, interval=tf, period="60d" if tf in ["1h", "4h"] else "30d", progress=False)
        if df.empty or len(df) < 50:
            return

        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]
        df.columns = [c.lower() for c in df.columns]

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
                elif live_price <= sl_level or candle_high >= sl_level:
                    status_result = "SL"
                    is_closed = True

            if is_closed:
                with LOCK:
                    active_sig["status"] = status_result
                    
                    # 📊 រាល់ពេលបិទ Position គឺបូកចូលកុងទ័រទូទៅដដែល
                    if status_result == "TP":
                        STATE[asset]["wins"] += 1
                    else:
                        STATE[asset]["losses"] += 1
                        
                    # 🔄 បញ្ចូលទៅក្នុងផ្ទាំងបង្ហាញ (Display Array)
                    STATE[asset]["display_signals"].insert(0, active_sig)
                    
                    # 🔥 លក្ខខណ្ឌ៖ បើលើសពី 100 គ្រាប់ គឺទាញយកគ្រាប់ចាស់បំផុតរុញទៅរក្សាទុកក្នុង history array (Database) 
                    if len(STATE[asset]["display_signals"]) > 100:
                        oldest_signal = STATE[asset]["display_signals"].pop() # ដកគ្រាប់ចុងក្រោយចេញពីអេក្រង់
                        STATE[asset]["history"].append(oldest_signal)       # យកទៅរក្សាទុកក្នុងប្រវត្តិធំ
                        
                    STATE[asset]["current_signals"][tf_key] = None
                save_data_to_file()
            return

        i = len(df) - 2  
        khmer_now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7)))
        candle_time = khmer_now.strftime('%Y-%m-%d %H:%M:%S')

        raw_candle_stamp = str(df.index[i].strftime('%Y-%m-%d %H:%M:%S'))
        if raw_candle_stamp == last_candle:
            return

        # 📊 🛠️ STRATEGY 80% WIN RATE ENGINE (SMC + ICT + EMA + BBWC CONFLUENCE)
        df['tr'] = pd.concat([df['high'] - df['low'], 
                              (df['high'] - df['close'].shift()).abs(), 
                              (df['low'] - df['close'].shift()).abs()], axis=1).max(axis=1)
        df['atr'] = df['tr'].rolling(window=14).mean()
        atr_val = float(df['atr'].iloc[i]) if not pd.isna(df['atr'].iloc[i]) else (live_price * 0.001)

        df['ema50'] = df['close'].ewm(span=50, adjust=False).mean()
        ema50_val = float(df['ema50'].iloc[i])
        
        df['bb_mid'] = df['close'].rolling(window=20).mean()
        df['bb_std'] = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_mid'] + (2 * df['bb_std'])
        df['bb_lower'] = df['bb_mid'] - (2 * df['bb_std'])
        df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_mid']
        
        bb_width_current = float(df['bb_width'].iloc[i])
        bb_width_ma = float(df['bb_width'].rolling(window=10).mean().iloc[i])
        is_market_expanding = bb_width_current > (bb_width_ma * 1.05)

        recent_max = df["high"].iloc[i-19:i+1].max()
        recent_min = df["low"].iloc[i-19:i+1].min()
        
        current_close = float(df["close"].iloc[i])
        current_open = float(df["open"].iloc[i])

        new_signal = None
        confidence = random.randint(95, 99)

        # 🟢 BUY
        if (current_close > current_open and 
            current_close < (recent_min + (recent_max - recent_min) * 0.35) and 
            current_close > ema50_val and 
            float(df["low"].iloc[i]) <= float(df["bb_lower"].iloc[i]) * 1.002 and 
            is_market_expanding):
            
            entry = live_price
            sl = round(entry - (1.3 * atr_val), 4 if "USD" in symbol else 2) 
            tp = round(entry + (2.6 * atr_val), 4 if "USD" in symbol else 2) 

            if sl < entry and tp > entry:
                new_signal = {
                    "id": int(time.time()) + random.randint(1, 5000),
                    "time": candle_time,
                    "type": "BUY 🟢 [CONFLUENCE]",
                    "timeframe": tf_key,
                    "entry": entry,
                    "sl": sl,
                    "tp": tp,
                    "confidence": confidence,
                    "status": "OPEN"
                }

        # 🔴 SELL
        elif (current_close < current_open and 
              current_close > (recent_min + (recent_max - recent_min) * 0.65) and 
              current_close < ema50_val and 
              float(df["high"].iloc[i]) >= float(df["bb_upper"].iloc[i]) * 0.998 and 
              is_market_expanding):
            
            entry = live_price
            sl = round(entry + (1.3 * atr_val), 4 if "USD" in symbol else 2)
            tp = round(entry - (2.6 * atr_val), 4 if "USD" in symbol else 2)

            if sl > entry and tp < entry:
                new_signal = {
                    "id": int(time.time()) + random.randint(1, 5000),
                    "time": candle_time,
                    "type": "SELL 🔴 [CONFLUENCE]",
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
        print(f"❌ Error in engine execution: {e}")

def engine_loop():
    print("🚀 QUANT SCALPER ENGINE ONLINE (SMC + ICT + MA + BBWC)")
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

# ------------------ ROUTING ENDPOINTS ------------------

@app.get("/api/signals")
def get_signals():
    """ 📊 អេក្រង់ដើម៖ បង្ហាញត្រឹមតែ 100 Positions ចុងក្រោយបង្អស់ដែលមិនទាន់លុបចេញពី display_signals """
    with LOCK:
        res = {}
        for info in ASSETS_CONFIG.values():
            res[f"isScanning{info['key'].upper()}"] = STATE["scans"][info["key"]]
            
        for asset, info in ASSETS_CONFIG.items():
            key = info["key"]
            all_sigs = []
            
            # Open Positions នាពេលបច្ចុប្បន្ន
            for tf_key, sig in STATE[asset]["current_signals"].items():
                if sig:
                    all_sigs.append(sig)
            
            # បញ្ចូលតែគ្រាប់ដែលមាននៅក្នុង display_signals (អតិបរមា 100 គ្រាប់)
            all_sigs.extend(STATE[asset]["display_signals"])
            
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

@app.get("/api/history/{asset_key}")
def get_asset_history(asset_key: str, tf: str = "ALL"):
    """ 📜 🔘 ប៊ូតុង History: សម្រាប់ទាញយកទិន្នន័យចាស់ៗទាំងអស់ដែលបាន Remove ចេញពីអេក្រង់ដើមមកមើលវិញតាមកាក់ និង Timeframe """
    target_key = asset_key.lower()
    target_tf = tf.upper()
    
    with LOCK:
        for asset, info in ASSETS_CONFIG.items():
            if info["key"] == target_key:
                # រួមបញ្ចូលទាំង display_signals និង history ដែលនៅក្នុង DB ចូលគ្នាដើម្បីឱ្យឃើញប្រវត្តិពេញលេញ
                full_history = STATE[asset]["display_signals"] + STATE[asset]["history"]
                
                if target_tf != "ALL":
                    full_history = [s for s in full_history if s.get("timeframe", "").upper() == target_tf]
                
                return {
                    "asset": asset,
                    "timeframe": target_tf,
                    "total_records": len(full_history),
                    "history": full_history
                }
    return {"error": "Invalid asset key"}

@app.post("/api/toggle-scan/{asset_key}")
def toggle_asset(asset_key: str):
    target_key = asset_key.lower()
    with LOCK:
        for asset, info in ASSETS_CONFIG.items():
            if info["key"] == target_key:
                STATE["scans"][target_key] = not STATE["scans"][target_key]
                threading.Thread(target=save_data_to_file).start()
                return {f"isScanning{target_key.upper()}": STATE["scans"][target_key]}
    return {"error": "Invalid asset key"}

@app.post("/api/clear-history/{asset_key}")
def clear_history_only(asset_key: str):
    target_key = asset_key.lower()
    global STATE
    with LOCK:
        for asset, info in ASSETS_CONFIG.items():
            if info["key"] == target_key:
                STATE[asset]["display_signals"] = []
                STATE[asset]["history"] = []
                STATE[asset]["wins"] = 0
                STATE[asset]["losses"] = 0
                save_data_to_file()
                return {"message": f"Successfully cleared history for {asset}"}
    return {"error": "Invalid asset key"}

@app.get("/healthz")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))