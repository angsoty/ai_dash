import time
import requests
import random

API = "http://127.0.0.1:8000/api/analyze-market"

symbols = ["XAUUSD", "BTCUSDT", "ETHUSDT", "SOLUSDT"]

def candle(price):
    return {
        "open": price,
        "high": price * (1 + random.uniform(0, 0.002)),
        "low": price * (1 - random.uniform(0, 0.002)),
        "close": price * (1 + random.uniform(-0.002, 0.002))
    }

while True:
    symbol = random.choice(symbols)
    base = 2300 if "XAU" in symbol else 100

    c1 = candle(base)
    c2 = candle(c1["close"])
    c3 = candle(c2["close"])

    payload = {
        "symbol": symbol,
        "timeframe": "M15",
        "c1": c1,
        "c2": c2,
        "c3": c3
    }

    requests.post(API, json=payload)
    print("sent:", symbol)

    time.sleep(5)