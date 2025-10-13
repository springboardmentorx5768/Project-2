#!/usr/bin/env python3
"""
BragBoard Database Viewer
Simple script to view the contents of the BragBoard SQLite database
"""

import sqlite3
import os
from datetime import datetime

def view_database():
    db_path = 'bragboard.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file 'bragboard.db' not found!")
        return
    
    print("🔍 BragBoard Database Contents")
    print("=" * 50)
    print(f"📁 Database: {db_path}")
    print(f"📅 Viewed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"\n📊 Found {len(tables)} tables:")
        for table in tables:
            print(f"  • {table[0]}")
        
        # View each table
        for table_name in [t[0] for t in tables]:
            print(f"\n" + "="*50)
            print(f"🗂️  TABLE: {table_name.upper()}")
            print("="*50)
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            print("\n📋 Schema:")
            for col in columns:
                col_id, name, data_type, not_null, default, pk = col
                pk_marker = " (PRIMARY KEY)" if pk else ""
                null_marker = " NOT NULL" if not_null else ""
                default_marker = f" DEFAULT {default}" if default else ""
                print(f"  • {name}: {data_type}{pk_marker}{null_marker}{default_marker}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            
            print(f"\n📊 Records: {count}")
            
            if count > 0:
                # Get all data
                cursor.execute(f"SELECT * FROM {table_name};")
                rows = cursor.fetchall()
                
                # Get column names for headers
                column_names = [description[0] for description in cursor.description]
                
                print("\n📄 Data:")
                
                # Print headers
                header = " | ".join(f"{col[:15]:15}" for col in column_names)
                print(f"  {header}")
                print(f"  {'-' * len(header)}")
                
                # Print rows
                for row in rows:
                    row_str = " | ".join(f"{str(val)[:15]:15}" for val in row)
                    print(f"  {row_str}")
                
                if count > 10:
                    print(f"  ... (showing first 10 of {count} records)")
            else:
                print("  (No records)")
    
    except Exception as e:
        print(f"❌ Error reading database: {e}")
    
    finally:
        conn.close()
    
    print("\n" + "="*50)
    print("✅ Database view complete!")

if __name__ == "__main__":
    view_database()