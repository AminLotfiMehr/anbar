import app from './backend/hono';

const port = parseInt(process.env.PORT || '3000');
const hostname = '0.0.0.0';

console.log(`[Server] Starting on port ${port}...`);

const server = Bun.serve({
  port,
  hostname,
  fetch: app.fetch,
});

console.log(`[Server] Server is running on http://0.0.0.0:${port}`);
console.log(`[Server] API endpoint: http://0.0.0.0:${port}/api`);
console.log(`[Server] tRPC endpoint: http://0.0.0.0:${port}/api/trpc`);
console.log(`[Server] External access: http://185.120.251.246:${port}`);

export default server;
