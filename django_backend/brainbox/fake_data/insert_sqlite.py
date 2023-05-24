import os
import sys
import sqlite3

from dotenv import load_dotenv

load_dotenv()

if len(sys.argv) != 2:
    print("Invalid arguments! SQL script must be provided!")
    exit()

connection = sqlite3.connect('../../' + os.getenv('DB_NAME'))
cursor = connection.cursor()

file = sys.argv[1]

print(f"Executing {file}...")
with open(file, 'r') as f:
    stmt = f.read()
    cursor.executescript(stmt)
print(f"Finished!")

cursor.close()

connection.commit()
connection.close()
