import sqlite3
from pathlib import Path

connection = sqlite3.connect('../../db.sqlite3')
cursor = connection.cursor()

sql_files = Path('shared_file_data').glob('*_all.sql')
for file in sql_files:
    print(f"Executing {file}...")
    with open(file, 'r') as f:
        stmt = f.read()
        cursor.executescript(stmt)
print(f"Finished!")

cursor.close()

connection.commit()
connection.close()
