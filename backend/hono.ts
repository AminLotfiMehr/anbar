import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { db } from "./db/storage";

const app = new Hono();

db.init().then(() => {
  console.log('[Server] Database initialized');
}).catch((error) => {
  console.error('[Server] Database initialization failed:', error);
});

app.use("*", cors({
  origin: (origin) => {
    console.log('[CORS] Request from origin:', origin);
    if (!origin) {
      return "*";
    }
    return origin;
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposeHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400,
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
  })
);

app.use("/assets/*", serveStatic({ root: "./dist" }));

app.get("/health", (c) => {
  return c.json({ status: "ok", message: "Server is healthy" });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", message: "Server is healthy" });
});

app.get("/*", serveStatic({ root: "./dist", path: "index.html" }));

export default app;
