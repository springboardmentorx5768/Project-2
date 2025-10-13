# BragBoard Test Credentials

## How Authentication Works

Your BragBoard app uses JWT (JSON Web Token) authentication. Here's what you need to know:

### Creating an Account

1. Go to the Registration page
2. Enter any username and password
3. The password is securely hashed and stored in the database
4. You get a JWT token that expires in 30 minutes

### Logging In

1. Use the same username and password you registered with
2. The app verifies your credentials against the database
3. You get a new JWT token for 30 minutes

## Test Credentials

You can create any credentials you want! Here are some examples:

### Option 1: Simple Test User

- **Username**: `testuser`
- **Password**: `password123`

### Option 2: Your Personal Account

- **Username**: `puppa` (or any name you prefer)
- **Password**: `mypassword` (choose any secure password)

### Option 3: Demo Account

- **Username**: `demo`
- **Password**: `demo123`

## Important Notes

1. **First Time**: You need to REGISTER first with any username/password
2. **Subsequent Times**: Use the SAME credentials to LOGIN
3. **Token Expiry**: Your session expires after 30 minutes (you'll need to login again)
4. **Database**: Your credentials are stored in a local SQLite database file
5. **Security**: Passwords are hashed with bcrypt - they're never stored in plain text

## Quick Start Steps

1. Open your app at: http://localhost:5174 (or check your terminal for the correct port)
2. Click "Register" and create an account with any username/password
3. Save these credentials somewhere safe
4. Use the same credentials anytime you want to login

## Servers Status

- Backend API: http://127.0.0.1:8001
- Frontend App: http://localhost:5174 (or the port shown in your terminal)
- API Docs: http://127.0.0.1:8001/docs

You can login anytime as long as:

- Both servers are running
- You use the exact same username and password you registered with
