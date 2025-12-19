# simulate_post.py - posts fake sensor data to backend every 3 seconds
import requests, time, random, os

BACKEND = os.environ.get('BACKEND_URL', 'http://localhost:5000/api/sensor-data')

def random_reading():
    flow = round(random.uniform(0.1, 8.0), 2)
    tds = round(random.uniform(20, 900), 1)
    turbidity = round(random.uniform(0, 120), 1)
    temp = round(random.uniform(20, 35), 1)
    total = round(random.uniform(0, 500), 2)
    alert = (tds > 600) or (turbidity > 50)
    return {
        "device_id": "esp32_sim_01",
        "flow_lpm": flow,
        "tds_ppm": tds,
        "turbidity": turbidity,
        "temperature_c": temp,
        "total_liters_today": total,
        "alert": alert
    }

if __name__ == "__main__":
    print("Simulator started. Posting to:", BACKEND)
    while True:
        p = random_reading()
        try:
            r = requests.post(BACKEND, json=p, timeout=5)
            print(time.strftime("%Y-%m-%d %H:%M:%S"), "->", r.status_code, p)
        except Exception as e:
            print("POST failed:", e)
        time.sleep(3)