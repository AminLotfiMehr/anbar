import app from './backend/hono';

const port = process.env.PORT || 3000;

console.log(`[Server] Starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};

console.log(`[Server] Server is running on http://localhost:${port}`);
console.log(`[Server] API endpoint: http://localhost:${port}/api`);
console.log(`[Server] tRPC endpoint: http://localhost:${port}/api/trpc`);
