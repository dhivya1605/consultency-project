#!/usr/bin/env python
"""
Test script to verify ML API is working correctly
Run this after starting the Flask API: python api/app.py
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

endpoints = [
    "/analytics",
    "/ml-demand-prediction",
    "/category-analysis",
    "/brand-analysis",
    "/top-products",
    "/price-distribution",
    "/rating-distribution",
    "/next-month-forecast"
]

print("🧪 Testing ML API Endpoints...\n")

for endpoint in endpoints:
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {endpoint}")
            print(f"   Response keys: {list(data.keys())}")
        else:
            print(f"❌ {endpoint} - Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print(f"❌ {endpoint} - Connection Error (Flask API not running?)")
    except Exception as e:
        print(f"❌ {endpoint} - Error: {str(e)}")

print("\n✨ If all endpoints show ✅, the ML API is working correctly!")
print("📊 Now refresh your browser at http://localhost:3000/admin/reports")
