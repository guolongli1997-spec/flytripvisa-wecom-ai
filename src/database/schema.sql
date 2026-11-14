CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  external_user_id TEXT,
  title TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wecom_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bot_name TEXT,
  bot_id TEXT,
  secret_encrypted TEXT,
  ws_url TEXT,
  enabled INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS connection_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  status TEXT,
  last_connected_at INTEGER,
  last_disconnected_at INTEGER,
  last_message_at INTEGER,
  received_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  error_detail TEXT
);
