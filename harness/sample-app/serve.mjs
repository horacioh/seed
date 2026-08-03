import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 39777);
const server = createServer(async (_request, response) => {
  try {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(await readFile(path.join(root, "index.html")));
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(String(error));
  }
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`HARNESS_SAMPLE_READY http://127.0.0.1:${port}\n`);
});

process.on("SIGTERM", () => server.close(() => process.exit(0)));
