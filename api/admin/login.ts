import type { IncomingMessage, ServerResponse } from "node:http";
import { createAdminCookie, createAdminSessionToken, isAdminPasswordConfigured, verifyAdminPassword } from "../../server/adminSession";

type ApiRequest = IncomingMessage & { body?: unknown };

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function isSameOrigin(req: ApiRequest) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin !== "string" || typeof host !== "string") return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export default function handler(req: ApiRequest, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Méthode non autorisée." });
  }
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: "Origine non autorisée." });
  if (!isAdminPasswordConfigured()) return sendJson(res, 503, { error: "L’accès administration n’est pas configuré." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: "Requête invalide." });
    }
  }

  const password = typeof body === "object" && body !== null ? (body as { password?: unknown }).password : undefined;
  if (!verifyAdminPassword(password)) return sendJson(res, 401, { error: "Mot de passe incorrect." });

  res.setHeader("Set-Cookie", createAdminCookie(createAdminSessionToken()));
  return sendJson(res, 200, { authenticated: true });
}
