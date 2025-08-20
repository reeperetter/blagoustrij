# import sqlite3

# conn = sqlite3.connect("locations.db")
# cursor = conn.cursor()

# cursor.execute("ALTER TABLE location ADD COLUMN priority TEXT DEFAULT 'Середній';")

# conn.commit()
# conn.close()

from ./app import db

with db.engine.connect() as conn:
    conn.execute("ALTER TABLE location ADD COLUMN priority VARCHAR(20) DEFAULT 'Середній';")