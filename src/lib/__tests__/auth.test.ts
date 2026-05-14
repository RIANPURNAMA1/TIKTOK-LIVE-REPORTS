import { describe, it, expect, beforeAll } from "vitest";
import { signToken, verifyToken, getTokenFromCookie } from "../auth";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key";
});

const mockUser = { id: 1, username: "admin", nama: "Admin", role: "admin" as const };

describe("signToken & verifyToken", () => {
  it("signs and verifies a valid token", () => {
    const token = signToken(mockUser);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe(1);
    expect(decoded!.username).toBe("admin");
    expect(decoded!.role).toBe("admin");
  });

  it("returns null for an invalid token", () => {
    expect(verifyToken("invalid-token")).toBeNull();
  });

  it("returns null for tampered token", () => {
    const token = signToken(mockUser);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(verifyToken(tampered)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(verifyToken("")).toBeNull();
  });
});

describe("getTokenFromCookie", () => {
  it("extracts token from cookie header", () => {
    const req = new Request("http://localhost", {
      headers: { cookie: "token=abc123; other=val" },
    });
    expect(getTokenFromCookie(req)).toBe("abc123");
  });

  it("returns null when no cookie header", () => {
    const req = new Request("http://localhost");
    expect(getTokenFromCookie(req)).toBeNull();
  });

  it("returns null when token cookie not present", () => {
    const req = new Request("http://localhost", {
      headers: { cookie: "other=val" },
    });
    expect(getTokenFromCookie(req)).toBeNull();
  });

  it("handles token at the start of cookie string", () => {
    const req = new Request("http://localhost", {
      headers: { cookie: "token=xyz" },
    });
    expect(getTokenFromCookie(req)).toBe("xyz");
  });

  it("handles empty cookie string", () => {
    const req = new Request("http://localhost", {
      headers: { cookie: "" },
    });
    expect(getTokenFromCookie(req)).toBeNull();
  });
});
