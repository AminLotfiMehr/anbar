import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.text("سرور انبارداری در حال اجرا است\nبرای استفاده از API از اپلیکیشن موبایل استفاده کنید.");
});

app.get("/health", (c) => {
  return c.json({ status: "ok", message: "Server is healthy" });
});

export default app;
