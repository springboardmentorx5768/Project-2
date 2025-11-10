#!/usr/bin/env python
"""Test script to verify all imports work correctly"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    from app.main import app
    print("[SUCCESS] Backend app imported successfully!")
    print("[SUCCESS] All modules loaded correctly!")
    print("\nYou can now start the server with:")
    print("  python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
    sys.exit(0)
except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

