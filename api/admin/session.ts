import type { IncomingMessage, ServerResponse } from "node:http";
import { isAdminPasswordConfigured, isAdminRequestAuthenticated } from "../../server/adminSessionRuntime.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(JSON.stringify({ authenticated: false }));
    return;
  }
  if (!isAdminPasswordConfigured()) {
    res.statusCode = 503;
    res.end(JSON.stringify({ authenticated: false, configured: false }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ authenticated: isAdminRequestAuthenticated(req.headers.cookie) }));
}
