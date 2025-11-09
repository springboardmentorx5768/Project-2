#!/usr/bin/env python3
"""
Check sample data script
"""

import sqlite3

def check_data():
    conn = sqlite3.connect('dev.db')
    cursor = conn.cursor()
    
    print("SHOUTOUTS:")
    cursor.execute('SELECT id, message, sender_id FROM shoutouts LIMIT 3')
    for row in cursor.fetchall():
        print(f'  ID: {row[0]}, Message: {row[1][:50]}..., Sender: {row[2]}')
    
    print("\nCOMMENTS:")
    cursor.execute('SELECT id, content, user_id, shoutout_id FROM comments')
    for row in cursor.fetchall():
        print(f'  ID: {row[0]}, Content: {row[1]}, User: {row[2]}, Shoutout: {row[3]}')
    
    print("\nREACTIONS:")
    cursor.execute('SELECT id, type, user_id, shoutout_id FROM reactions')
    for row in cursor.fetchall():
        print(f'  ID: {row[0]}, Type: {row[1]}, User: {row[2]}, Shoutout: {row[3]}')
    
    conn.close()

if __name__ == "__main__":
    check_data()