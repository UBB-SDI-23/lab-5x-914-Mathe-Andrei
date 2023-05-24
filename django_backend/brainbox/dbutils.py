import os
import psycopg2
import sqlite3


def execute_sqlite(file):
    print(os.getcwd())
    connection = sqlite3.connect(os.getenv('DB_NAME'))
    cursor = connection.cursor()

    print(f"Executing {file}...")
    with open(file, 'r') as f:
        stmt = f.read()
        cursor.executescript(stmt)
    print(f"Finished!")

    cursor.close()

    connection.commit()
    connection.close()


def execute_postgresql(file):
    conn = psycopg2.connect(database=os.getenv('DB_NAME'), host=os.getenv('DB_HOST'), user=os.getenv('DB_USER'), password=os.getenv('DB_PASSWORD'), port=os.getenv('DB_PORT'))
    cursor = conn.cursor()

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
