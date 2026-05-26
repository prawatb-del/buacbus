import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(process.cwd(), "scores.json");

// Helper to load scores
function loadScores() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading scores file, resetting:", error);
  }
  return [];
}

// Helper to save scores
function saveScores(scores: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing scores file:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get Scoreboard
  app.get("/api/scores", (req, res) => {
    const scores = loadScores();
    res.json(scores);
  });

  // Submit Score
  app.post("/api/scores", (req, res) => {
    const { username, email, brandName, businessActivity, businessType, revenue, assets, capital, score } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: "Username and Email are required." });
    }

    const scores = loadScores();
    const newRecord = {
      id: Date.now().toString(),
      username,
      email,
      brandName: brandName || "N/A",
      businessActivity: businessActivity || "N/A",
      businessType: businessType || "N/A",
      revenue: Number(revenue) || 0,
      assets: Number(assets) || 0,
      capital: Number(capital) || 0,
      score: Number(score) || 0,
      completedAt: new Date().toISOString()
    };

    scores.push(newRecord);
    saveScores(scores);
    res.status(201).json({ success: true, record: newRecord });
  });

  // Delete All Scores (Admin)
  app.delete("/api/scores", (req, res) => {
    saveScores([]);
    res.json({ success: true, message: "All scores deleted successfully." });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
