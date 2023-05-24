import os
import sys
import psycopg2

from dotenv import load_dotenv

load_dotenv()

if len(sys.argv) != 2:
    print("Invalid arguments! SQL script must be provided!")
    exit()

conn = psycopg2.connect(database=os.getenv('DB_NAME'), host=os.getenv('DB_HOST'), user=os.getenv('DB_USER'), password=os.getenv('DB_PASSWORD'), port=os.getenv('DB_PORT'))
cursor = conn.cursor()

file = sys.argv[1]

print(f"Executing {file}...")
with open(file, 'r') as f:
    stmts = f.read()
    stmts = stmts.split(';')[:-1]
    total_batches = len(stmts)
    batch = 1
    for stmt in stmts:
        print(f"Batch {batch}/{total_batches}")
        cursor.execute(stmt + ';')
        batch += 1
    print("Finished!")

cursor.close()

conn.commit()
conn.close()
