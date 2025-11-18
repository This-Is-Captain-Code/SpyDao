import type { Express } from "express";
import { createServer, type Server } from "http";
// Commented out webhook routes from previous session - not needed for DApp
// import webhookRoutes from "./routes/webhookRoutes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register webhook and trading routes
  // app.use("/api/webhook", webhookRoutes);

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: ["alpaca", "portfolio", "rebalancing"],
      version: "1.0.0"
    });
  });

  // Root API info
  app.get("/api", (req, res) => {
    res.json({
      name: "SpyDAO Trading Server",
      version: "1.0.0",
      endpoints: {
        health: "/api/health",
        webhook: "/api/webhook",
        portfolio: "/api/webhook/portfolio/status",
        rebalancing: "/api/webhook/rebalance",
        spy: "/api/webhook/spy/composition"
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
