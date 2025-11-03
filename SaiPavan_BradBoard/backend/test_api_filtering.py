import requests
import json

# Test API endpoints
base_url = "http://127.0.0.1:8000/api/v1"

def test_api_department_filtering():
    """Test the API endpoints with department filtering"""
    
    print("🔗 Testing API department filtering...")
    
    # Test Engineering user
    print("\n👤 Testing Engineering user...")
    eng_login = {"username": "test@example.com", "password": "testpassword123"}
    eng_response = requests.post(f"{base_url}/auth/token", data=eng_login)
    
    if eng_response.status_code == 200:
        eng_token = eng_response.json()["access_token"]
        eng_headers = {"Authorization": f"Bearer {eng_token}"}
        
        # Get user info
        user_resp = requests.get(f"{base_url}/users/me", headers=eng_headers)
        user = user_resp.json()
        print(f"   User: {user['email']} (Department: {user.get('department')})")
        
        # Get shoutouts
        shoutouts_resp = requests.get(f"{base_url}/shoutouts/", headers=eng_headers)
        if shoutouts_resp.status_code == 200:
            shoutouts = shoutouts_resp.json()
            print(f"   Sees {len(shoutouts)} shoutouts")
            
            # Show visibility info for recent shoutouts
            recent_shoutouts = [s for s in shoutouts if s['id'] >= 6]  # Our test shoutouts
            for shoutout in recent_shoutouts:
                dept = shoutout.get('target_department', 'None')
                is_all = shoutout.get('is_all', True)
                visibility = "All users" if is_all else f"Department: {dept}"
                print(f"     - ID {shoutout['id']}: {visibility} - {shoutout['message'][:30]}...")
        else:
            print(f"   ❌ Failed to get shoutouts: {shoutouts_resp.status_code}")
    else:
        print(f"   ❌ Engineering login failed: {eng_response.status_code}")
    
    # Test HR user
    print("\n👤 Testing HR user...")
    hr_login = {"username": "hr@example.com", "password": "hrpassword123"}
    hr_response = requests.post(f"{base_url}/auth/token", data=hr_login)
    
    if hr_response.status_code == 200:
        hr_token = hr_response.json()["access_token"]
        hr_headers = {"Authorization": f"Bearer {hr_token}"}
        
        # Get user info
        user_resp = requests.get(f"{base_url}/users/me", headers=hr_headers)
        user = user_resp.json()
        print(f"   User: {user['email']} (Department: {user.get('department')})")
        
        # Get shoutouts
        shoutouts_resp = requests.get(f"{base_url}/shoutouts/", headers=hr_headers)
        if shoutouts_resp.status_code == 200:
            shoutouts = shoutouts_resp.json()
            print(f"   Sees {len(shoutouts)} shoutouts")
            
            # Show visibility info for recent shoutouts
            recent_shoutouts = [s for s in shoutouts if s['id'] >= 6]  # Our test shoutouts
            for shoutout in recent_shoutouts:
                dept = shoutout.get('target_department', 'None')
                is_all = shoutout.get('is_all', True)
                visibility = "All users" if is_all else f"Department: {dept}"
                print(f"     - ID {shoutout['id']}: {visibility} - {shoutout['message'][:30]}...")
        else:
            print(f"   ❌ Failed to get shoutouts: {shoutouts_resp.status_code}")
    else:
        print(f"   ❌ HR login failed: {hr_response.status_code}")
    
    print("\n✅ API department filtering test completed!")

if __name__ == "__main__":
    try:
        test_api_department_filtering()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")