import path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import "dotenv/config";
import AutoLoad from "@fastify/autoload";
import fastifyCors from "@fastify/cors";

import { fastify } from "./lib/fastify.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "routes"),
});

fastify.register(fastifyCors, {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
});

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("database connection successful");

    await fastify.listen({ port, host });
    logger.info(`server is listening on http://${host}:${port}...`);
  } catch (err) {
    logger.error(`failed to start server: ${err}`);
  }
}

startServer();
