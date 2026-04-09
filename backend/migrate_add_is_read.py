#!/usr/bin/env python3
"""
Migration script to add is_read column to Inventory table
Run this script to update existing databases with the new column
"""

import sqlite3
import os

DB_PATH = "test.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"[Warning] Database {DB_PATH} not found. It will be created on next run.")
        return
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(inventories);")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_read' in columns:
            print("[Info] 'is_read' column already exists in inventories table")
            return
        
        # Add the column if it doesn't exist
        print("[Info] Adding 'is_read' column to inventories table...")
        cursor.execute("ALTER TABLE inventories ADD COLUMN is_read INTEGER DEFAULT 0;")
        
        conn.commit()
        print("[Success] Migration completed! 'is_read' column added with default value 0")
        
        # Verify
        cursor.execute("PRAGMA table_info(inventories);")
        columns = cursor.fetchall()
        print("[Debug] Updated table schema:")
        for col in columns:
            print(f"  - {col[1]}: {col[2]}")
        
    except sqlite3.Error as e:
        print(f"[Error] Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate()
