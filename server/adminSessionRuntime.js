import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "icimo_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 4 * 60 * 60;

function getAdminPassword() {
  return process.env.ICIMO_ADMIN_PASSWORD ?? "";
}

export function isAdminPasswordConfigured() {
  return getAdminPassword().length > 0;
}

/** @param {unknown} candidate */
export function verifyAdminPassword(candidate) {
  const expected = getAdminPassword();
  if (!expected || typeof candidate !== "string") return false;

  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  const candidateDigest = createHash("sha256").update(candidate, "utf8").digest();
  return timingSafeEqual(expectedDigest, candidateDigest);
}

/** @param {number} [nowMs] */
export function createAdminSessionToken(nowMs = Date.now()) {
  const signingKey = getAdminPassword();
  if (!signingKey) throw new Error("ICIMO_ADMIN_PASSWORD is not configured");

  const expiresAt = Math.floor(nowMs / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = Buffer.from(String(expiresAt), "utf8").toString("base64url");
  const signature = createHmac("sha256", signingKey).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

/** @param {string | undefined} token @param {number} [nowMs] */
export function isValidAdminSessionToken(token, nowMs = Date.now()) {
  const signingKey = getAdminPassword();
  if (!token || !signingKey) return false;

  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra !== undefined) return false;

  const expectedSignature = createHmac("sha256", signingKey).update(payload).digest("base64url");
  const expectedBytes = Buffer.from(expectedSignature, "utf8");
  const suppliedBytes = Buffer.from(suppliedSignature, "utf8");
  if (expectedBytes.length !== suppliedBytes.length || !timingSafeEqual(expectedBytes, suppliedBytes)) return false;

  try {
    const expiresAt = Number(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isSafeInteger(expiresAt) && expiresAt > Math.floor(nowMs / 1000);
  } catch {
    return false;
  }
}

/** @param {string | undefined} cookieHeader */
export function getAdminTokenFromCookie(cookieHeader) {
  const pair = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`));
  return pair ? pair.slice(ADMIN_COOKIE_NAME.length + 1) : undefined;
}

/** @param {string | undefined} cookieHeader @param {number} [nowMs] */
export function isAdminRequestAuthenticated(cookieHeader, nowMs = Date.now()) {
  return isValidAdminSessionToken(getAdminTokenFromCookie(cookieHeader), nowMs);
}

/** @param {string} token */
export function createAdminCookie(token) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${token}; Path=/; Max-Age=${ADMIN_SESSION_TTL_SECONDS}; HttpOnly; SameSite=Strict${secure}`;
}

export function clearAdminCookie() {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict${secure}`;
}
