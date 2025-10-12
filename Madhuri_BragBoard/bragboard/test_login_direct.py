import requests
import json

# Test login directly
def test_login():
    url = "http://127.0.0.1:8000/api/auth/login"
    credentials = {
        "email": "22a31a4424@gmail.com",
        "password": "password123"
    }
    
    print(f"Testing login at: {url}")
    print(f"Credentials: {credentials}")
    
    try:
        response = requests.post(url, json=credentials)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ LOGIN SUCCESS!")
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print("❌ LOGIN FAILED")
            print(f"Error: {response.text}")
            
        # Also test the root endpoint
        root_response = requests.get("http://127.0.0.1:8000/")
        print(f"\nRoot endpoint status: {root_response.status_code}")
        
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    test_login()