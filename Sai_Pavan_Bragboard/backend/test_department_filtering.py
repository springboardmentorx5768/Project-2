import requests
import json

# Test API endpoints
base_url = "http://127.0.0.1:8000/api/v1"

# Login to get a token
login_data = {
    "username": "test@example.com",
    "password": "testpassword123"
}

try:
    # Login
    response = requests.post(f"{base_url}/auth/login", data=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login successful")
        
        # Get current user info
        user_response = requests.get(f"{base_url}/users/me", headers=headers)
        if user_response.status_code == 200:
            user = user_response.json()
            print(f"✅ Current user: {user['email']} (Department: {user.get('department', 'None')})")
        else:
            print(f"❌ Failed to get user info: {user_response.text}")
        
        # Test getting shoutouts (this should now use department filtering)
        shoutouts_response = requests.get(f"{base_url}/shoutouts/", headers=headers)
        if shoutouts_response.status_code == 200:
            shoutouts = shoutouts_response.json()
            print(f"✅ Retrieved {len(shoutouts)} shoutouts with department filtering")
            
            # Show details of each shoutout
            for i, shoutout in enumerate(shoutouts):
                is_all = shoutout.get('is_all', True)
                target_dept = shoutout.get('target_department', None)
                sender_id = shoutout.get('sender_id')
                recipients = shoutout.get('recipients', [])
                
                print(f"  Shoutout {i+1}:")
                print(f"    Message: {shoutout['message'][:50]}...")
                print(f"    Sender ID: {sender_id}")
                print(f"    Is for all users: {is_all}")
                print(f"    Target department: {target_dept}")
                print(f"    Recipients: {[r.get('email', 'unknown') for r in recipients]}")
                print()
        else:
            print(f"❌ Failed to get shoutouts: {shoutouts_response.text}")
        
        # Test creating a department-specific shoutout
        new_shoutout = {
            "message": "Test department-specific shoutout for Engineering team",
            "recipients": [user["id"]],  # Send to self
            "is_all": False,
            "target_department": "Engineering"
        }
        
        create_response = requests.post(f"{base_url}/shoutouts/", 
                                      json=new_shoutout, 
                                      headers=headers)
        if create_response.status_code == 200:
            print("✅ Created department-specific shoutout")
            created_shoutout = create_response.json()
            print(f"   Created shoutout ID: {created_shoutout['id']}")
            print(f"   Is for all: {created_shoutout.get('is_all')}")
            print(f"   Target department: {created_shoutout.get('target_department')}")
        else:
            print(f"❌ Failed to create shoutout: {create_response.text}")
            
    else:
        print(f"❌ Login failed: {response.text}")

except requests.exceptions.ConnectionError:
    print("❌ Could not connect to backend. Make sure it's running on port 8000")
except Exception as e:
    print(f"❌ Error: {e}")