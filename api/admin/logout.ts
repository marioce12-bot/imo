import type { IncomingMessage, ServerResponse } from "node:http";
import { clearAdminCookie } from "../../server/adminSession";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    res.end();
    return;
  }
  res.setHeader("Set-Cookie", clearAdminCookie());
  res.statusCode = 204;
  res.end();
}
