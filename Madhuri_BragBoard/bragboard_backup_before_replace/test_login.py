import requests
import json

# Test login with common passwords
email = '22a31a4424@gmail.com'
common_passwords = ['password', 'password123', '123456', 'test123', 'mypassword', 'admin', 'demo']

print(f'Testing login for: {email}')
print('Backend server should be running on http://127.0.0.1:8000')

for password in common_passwords:
    try:
        response = requests.post('http://127.0.0.1:8000/api/auth/login', 
                               json={'email': email, 'password': password})
        if response.status_code == 200:
            print(f'✅ SUCCESS! Password is: {password}')
            print('Login response:', response.json())
            break
        else:
            print(f'❌ Failed with password "{password}": {response.status_code}')
            if response.status_code != 401:  # If not just wrong password
                print('Response:', response.text)
    except Exception as e:
        print(f'Error testing password "{password}": {e}')
        break  # If we can't connect to server, stop trying