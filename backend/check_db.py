import sqlite3
import os

db_file = 'test.db'
if not os.path.exists(db_file):
    print(f"[Error] Database file not found: {db_file}")
else:
    print(f"[Info] Database file exists: {db_file}")
    conn = sqlite3.connect(db_file)
    c = conn.cursor()
    
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = c.fetchall()
    print(f"[Info] Tables: {tables}")
    
    if len(tables) > 0:
        c.execute("PRAGMA table_info(inventories)")
        cols = c.fetchall()
        print(f"[Info] Inventory columns:")
        for col in cols:
            print(f"  - {col[1]}: {col[2]}")
    
    conn.close()
