#!/usr/bin/env python3
import requests
import json

def test_ml_api():
    base_url = "http://localhost:8000"
    
    print("Testing ML API...")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health check: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test 2: Recommendations
    try:
        data = {
            "userId": "test123",
            "purchasedProducts": ["prod1", "prod2"],
            "viewedProducts": ["prod3", "prod4"],
            "limit": 5
        }
        response = requests.post(f"{base_url}/api/recommend", json=data)
        print(f"✅ Recommendations: {response.json()}")
    except Exception as e:
        print(f"❌ Recommendations failed: {e}")

if __name__ == "__main__":
    test_ml_api()