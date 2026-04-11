import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/apply/route";
import { seedStore } from "../setup";

function makeGetRequest(email?: string): Request {
  const url = email
    ? `http://localhost:3000/api/apply?email=${encodeURIComponent(email)}`
    : "http://localhost:3000/api/apply";
  return new Request(url, { method: "GET" });
}

describe("GET /api/apply?email=", () => {
  it("existing application returns status + applied_at", async () => {
    const ts = Date.now() - 86400000; // 1 day ago
    seedStore("applications", [
      {
        id: "app-1",
        email: "found@example.com",
        status: "pending",
        createdAt: ts,
        name: "Tester",
      },
    ]);

    const res = await GET(makeGetRequest("found@example.com"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("pending");
    expect(data.applied_at).toBe(ts);
  });

  it("non-existing email returns 'not_found'", async () => {
    const res = await GET(makeGetRequest("nobody@example.com"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("not_found");
  });

  it("missing email param returns 400", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Email required");
  });

  it("email is case-insensitive (normalized to lowercase)", async () => {
    seedStore("applications", [
      {
        id: "app-2",
        email: "case@example.com",
        status: "approved",
        createdAt: Date.now(),
      },
    ]);

    const res = await GET(makeGetRequest("CASE@example.com"));
    const data = await res.json();
    expect(data.status).toBe("approved");
  });

  it("returns different statuses correctly", async () => {
    seedStore("applications", [
      {
        id: "app-3",
        email: "rejected@example.com",
        status: "rejected",
        createdAt: Date.now(),
      },
    ]);

    const res = await GET(makeGetRequest("rejected@example.com"));
    const data = await res.json();
    expect(data.status).toBe("rejected");
  });
});
