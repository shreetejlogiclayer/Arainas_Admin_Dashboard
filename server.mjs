import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./dist/", import.meta.url)));
const apiUrl = new URL(process.env.ADMIN_API_URL || "http://localhost:5001");
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  if (req.url?.startsWith("/api/admin/")) {
    try {
      const url = new URL(req.url, apiUrl);
      const headers = { accept: "application/json" };
      if (req.headers.cookie) headers.cookie = req.headers.cookie;
      if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"];
      const body = ["GET", "HEAD"].includes(req.method) ? undefined : await readBody(req);
      const upstream = await fetch(url, { method: req.method, headers, body, redirect: "manual" });
      res.writeHead(upstream.status, {
        "content-type": upstream.headers.get("content-type") || "application/json",
        ...(upstream.headers.getSetCookie().length
          ? { "set-cookie": upstream.headers.getSetCookie() }
          : {}),
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      console.error("Admin API proxy failed:", error.message);
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: { message: "Admin API is unavailable." } }));
    }
    return;
  }

  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  let requested;
  try {
    requested = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
  } catch {
    res.writeHead(400).end("Invalid path");
    return;
  }
  const file = resolve(root, requested);
  if (!file.startsWith(`${root}${sep}`)) {
    res.writeHead(404).end("Not found");
    return;
  }
  try {
    const stream = createReadStream(file);
    stream.on("open", () => res.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "x-content-type-options": "nosniff",
    }));
    stream.on("error", () => {
      if (res.headersSent) return res.end();
      if (extname(file)) {
        res.writeHead(404).end("Not found");
        return;
      }
      const fallback = createReadStream(resolve(root, "index.html"));
      fallback.on("open", () => res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "x-content-type-options": "nosniff",
      }));
      fallback.on("error", () => res.writeHead(500).end("Dashboard build is missing. Run npm run build."));
      fallback.pipe(res);
    });
    stream.pipe(res);
  } catch {
    res.writeHead(500).end("Dashboard build is missing. Run npm run build.");
  }
}).listen(port, () => console.log(`ARAINA Admin: http://localhost:${port}`));

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolveBody(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
