import requests
import json

# Register a new account via the API
registration_data = {
    "email": "22a31a4424@gmail.com",
    "password": "password123", 
    "full_name": "Puppa User"
}

print("Registering new account...")
print(f"Email: {registration_data['email']}")
print(f"Password: {registration_data['password']}")

try:
    # Try to register
    response = requests.post('http://127.0.0.1:8000/api/auth/register', 
                           json=registration_data)
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        user_data = response.json()
        print(f"User created: {user_data}")
        
        # Now test login
        print("\nTesting login...")
        login_response = requests.post('http://127.0.0.1:8000/api/auth/login',
                                     json={
                                         "email": registration_data['email'],
                                         "password": registration_data['password']
                                     })
        
        if login_response.status_code == 200:
            print("✅ Login successful!")
            print("Login data:", login_response.json())
            print(f"\n🎉 YOUR CREDENTIALS ARE WORKING:")
            print(f"Email: {registration_data['email']}")
            print(f"Password: {registration_data['password']}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print("Response:", login_response.text)
            
    elif response.status_code == 400:
        print("⚠️  User might already exist, trying login...")
        login_response = requests.post('http://127.0.0.1:8000/api/auth/login',
                                     json={
                                         "email": registration_data['email'],
                                         "password": registration_data['password']
                                     })
        
        if login_response.status_code == 200:
            print("✅ Login successful with existing account!")
            print(f"\n🎉 YOUR CREDENTIALS ARE:")
            print(f"Email: {registration_data['email']}")
            print(f"Password: {registration_data['password']}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print("Try a different password or register with a new email")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print("Response:", response.text)
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure the backend server is running on http://127.0.0.1:8000")