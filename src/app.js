import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import apiRoutes from "./index.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// routes
app.use("/api/v1", apiRoutes);

// simple health
app.get("/health", (req, res) => res.json({ ok: true }));

// API docs (Swagger)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

export default app;
