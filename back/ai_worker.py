import redis
import json
import random
import time

r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)
pubsub = r.pubsub()
pubsub.subscribe('market:stream')

print("AI Worker Running...")

for msg in pubsub.listen():
    if msg["type"] == "message":

        data = json.loads(msg["data"])

        symbol = data["symbol"]

        winrate = round(random.uniform(60, 90), 2)

        entry = data["c3"]["close"]
        tp = entry * 1.01
        sl = entry * 0.99

        result = {
            "database_id": data["database_id"],
            "symbol": symbol,
            "ai_win_rate": winrate,
            "prediction": "BUY" if winrate > 75 else "HOLD",

            "entry_price": entry,
            "tp_price": tp,
            "sl_price": sl,

            "tp_count": random.randint(1, 5),
            "sl_count": random.randint(0, 3),
            "position_count": random.randint(1, 10)
        }

        r.publish("ai:predictions", json.dumps(result))

        print("AI SENT:", result)