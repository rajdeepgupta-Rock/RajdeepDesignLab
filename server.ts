import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("portfolio.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    imageUrl TEXT NOT NULL,
    category TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY createdAt DESC").all();
    res.json(projects);
  });

  app.post("/api/projects", (req, res) => {
    const { title, description, imageUrl, category } = req.body;
    const info = db.prepare(
      "INSERT INTO projects (title, description, imageUrl, category) VALUES (?, ?, ?, ?)"
    ).run(title, description, imageUrl, category);
    
    const newProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(info.lastInsertRowid);
    res.json(newProject);
  });

  app.put("/api/projects/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, category } = req.body;
    db.prepare(
      "UPDATE projects SET title = ?, description = ?, category = ? WHERE id = ?"
    ).run(title, description, category, id);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
