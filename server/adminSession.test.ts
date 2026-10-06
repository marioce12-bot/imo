import { afterEach, describe, expect, it } from "vitest";
import { createAdminSessionToken, getAdminTokenFromCookie, isAdminRequestAuthenticated, isValidAdminSessionToken, verifyAdminPassword } from "./adminSession";

const originalPassword = process.env.ICIMO_ADMIN_PASSWORD;

afterEach(() => {
  if (originalPassword === undefined) delete process.env.ICIMO_ADMIN_PASSWORD;
  else process.env.ICIMO_ADMIN_PASSWORD = originalPassword;
});

describe("ICIMO admin session", () => {
  it("compares passwords without accepting a different value", () => {
    process.env.ICIMO_ADMIN_PASSWORD = "unit-test-password";
    expect(verifyAdminPassword("unit-test-password")).toBe(true);
    expect(verifyAdminPassword("incorrect-password")).toBe(false);
    expect(verifyAdminPassword(undefined)).toBe(false);
  });

  it("creates a signed session that expires after its configured lifetime", () => {
    process.env.ICIMO_ADMIN_PASSWORD = "unit-test-password";
    const now = Date.UTC(2026, 9, 6, 9, 0, 0);
    const token = createAdminSessionToken(now);
    expect(isValidAdminSessionToken(token, now)).toBe(true);
    expect(isValidAdminSessionToken(token, now + 4 * 60 * 60 * 1000 + 1)).toBe(false);
    expect(isValidAdminSessionToken(`${token}x`, now)).toBe(false);
  });

  it("reads the session cookie and validates it on a request", () => {
    process.env.ICIMO_ADMIN_PASSWORD = "unit-test-password";
    const now = Date.UTC(2026, 9, 6, 9, 0, 0);
    const token = createAdminSessionToken(now);
    const header = `other=value; icimo_admin_session=${token}; theme=dark`;
    expect(getAdminTokenFromCookie(header)).toBe(token);
    expect(isAdminRequestAuthenticated(header, now)).toBe(true);
  });
});
