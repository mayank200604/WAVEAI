# import sqlite3

# conn = sqlite3.connect("wave_admin.db")
# cur = conn.cursor()
# cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
# print("Tables:", cur.fetchall())  # 👈 make sure this print() is here
# conn.close()


# # show_routes.py
# from app import app
# print("Routes registered:")
# for rule in app.url_map.iter_rules():
#     print(rule)


# upgrade_schema.py
import sqlite3, os, sys

DB = "wave_admin.db"
if not os.path.exists(DB):
    print("DB file not found:", DB)
    sys.exit(1)

# List of (table, column, sql_type, default_sql) to ensure exist
COLUMNS = [
    # api_calls (we saw created_at missing)
    ("api_calls", "created_at", "TEXT", "CURRENT_TIMESTAMP"),
    ("api_calls", "request_meta", "TEXT", "NULL"),
    ("api_calls", "latency_ms", "INTEGER", "0"),
    ("api_calls", "method", "TEXT", "NULL"),
    ("api_calls", "status_code", "INTEGER", "NULL"),
    ("api_calls", "success", "INTEGER", "0"),
    ("api_calls", "error", "TEXT", "NULL"),

    # ideas
    ("ideas", "created_at", "TEXT", "CURRENT_TIMESTAMP"),
    ("ideas", "user_metadata", "TEXT", "NULL"),
    ("ideas", "market_potential", "REAL", "NULL"),
    ("ideas", "technical_risk", "REAL", "NULL"),
    ("ideas", "competition_score", "REAL", "NULL"),
    ("ideas", "composite_score", "REAL", "NULL"),
    ("ideas", "external_data", "TEXT", "NULL"),
    ("ideas", "client_request_id", "TEXT", "NULL"),

    # idea_mutations
    ("idea_mutations", "mutation_timestamp", "TEXT", "CURRENT_TIMESTAMP"),
    ("idea_mutations", "mutation_meta", "TEXT", "NULL"),
    ("idea_mutations", "mutation_viability_score", "REAL", "NULL"),

    # website_generations
    ("website_generations", "created_at", "TEXT", "CURRENT_TIMESTAMP"),
    ("website_generations", "files_path", "TEXT", "NULL"),
    ("website_generations", "business_model", "TEXT", "NULL"),
    ("website_generations", "branding", "TEXT", "NULL"),

    # chat_logs
    ("chat_logs", "created_at", "TEXT", "CURRENT_TIMESTAMP"),
    ("chat_logs", "chat_duration_ms", "INTEGER", "NULL"),
    ("chat_logs", "llm_model", "TEXT", "NULL"),
    ("chat_logs", "session_id", "TEXT", "NULL"),

    # llm_usage (if you plan to use)
    ("llm_usage", "llm_model", "TEXT", "NULL"),
    ("llm_usage", "count", "INTEGER", "0")
]

def table_columns(conn, table):
    cur = conn.execute("PRAGMA table_info(%s)" % table)
    return [r[1] for r in cur.fetchall()]

def ensure_table_exists(conn, table):
    # If table missing, create a simple scaffold so columns can be added.
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
    if not cur.fetchone():
        print(f"[upgrade] Table '{table}' missing — creating minimal table '{table}'")
        # create a minimal version depending on table name
        if table == "api_calls":
            conn.execute("""
                CREATE TABLE api_calls (
                    id INTEGER PRIMARY KEY AUTOINCREMENT
                )
            """)
        elif table == "ideas":
            conn.execute("CREATE TABLE ideas (id INTEGER PRIMARY KEY AUTOINCREMENT)")
        elif table == "idea_mutations":
            conn.execute("CREATE TABLE idea_mutations (id INTEGER PRIMARY KEY AUTOINCREMENT)")
        elif table == "website_generations":
            conn.execute("CREATE TABLE website_generations (id INTEGER PRIMARY KEY AUTOINCREMENT)")
        elif table == "chat_logs":
            conn.execute("CREATE TABLE chat_logs (id INTEGER PRIMARY KEY AUTOINCREMENT)")
        elif table == "llm_usage":
            conn.execute("CREATE TABLE llm_usage (id INTEGER PRIMARY KEY AUTOINCREMENT)")
        conn.commit()

def main():
    conn = sqlite3.connect(DB)
    try:
        for table, col, typ, default in COLUMNS:
            ensure_table_exists(conn, table)
            cols = table_columns(conn, table)
            if col in cols:
                # already present
                #print(f"[upgrade] {table}.{col} already exists")
                continue
            # add the column
            try:
                sql = f"ALTER TABLE {table} ADD COLUMN {col} {typ}"
                # For SQLite, can't easily add DEFAULT with non-constant expression; avoid messing defaults
                conn.execute(sql)
                conn.commit()
                print(f"[upgrade] Added column {table}.{col} ({typ})")
            except Exception as e:
                print(f"[upgrade] Failed to add {table}.{col}: {e}")
        print("[upgrade] Schema upgrade completed.")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
