import sqlite3

file = 'profile_data.sql'
connection = sqlite3.connect('../../db.sqlite3')
cursor = connection.cursor()

print(f"Executing {file}...")
with open(file, 'r') as f:
    stmt = f.read()
    cursor.executescript(stmt)
print(f"Finished!")

cursor.close()

connection.commit()
connection.close()
