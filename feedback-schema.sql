CREATE TABLE IF NOT EXISTS feedback (
 id TEXT PRIMARY KEY,
 game TEXT NOT NULL,
 category TEXT NOT NULL CHECK(category IN ('idea','bug','feedback')),
 message TEXT NOT NULL CHECK(length(message) BETWEEN 10 AND 1000),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewed','resolved'))
);
CREATE INDEX IF NOT EXISTS feedback_created_at ON feedback(created_at);
