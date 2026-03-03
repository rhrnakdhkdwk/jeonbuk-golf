import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("golf_center.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age TEXT NOT NULL,
    contact TEXT NOT NULL,
    region TEXT NOT NULL,
    available_time TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed initial data if empty
const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (postCount.count === 0) {
  const insertPost = db.prepare("INSERT INTO posts (title, content, category, image_url) VALUES (?, ?, ?, ?)");
  insertPost.run("2026년 신입 캐디 교육생 모집 안내", "전북골프경기지원센터에서 열정 넘치는 신입 캐디를 모집합니다. 체계적인 교육과 확실한 취업을 보장합니다.", "공지사항", "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800");
  insertPost.run("캐디 업무의 매력과 비전", "전문직으로서의 캐디, 높은 수익과 자유로운 시간 활용이 가능합니다. 지금 도전하세요.", "블로그", "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800");
}

// Update existing 2024 titles to 2026
db.prepare("UPDATE posts SET title = REPLACE(title, '2024년', '2026년') WHERE title LIKE '%2024년%'").run();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { title, content, category, image_url } = req.body;
    const info = db.prepare("INSERT INTO posts (title, content, category, image_url) VALUES (?, ?, ?, ?)").run(title, content, category, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/consultations", (req, res) => {
    const { name, age, contact, region, available_time } = req.body;
    const info = db.prepare("INSERT INTO consultations (name, age, contact, region, available_time) VALUES (?, ?, ?, ?, ?)").run(name, age, contact, region, available_time);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
