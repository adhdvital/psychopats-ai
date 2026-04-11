import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/subscribe/route";
import { seedStore } from "../setup";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  it("valid email returns 'subscribed'", async () => {
    const res = await POST(makeRequest({ email: "new@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("subscribed");
  });

  it("duplicate email returns 'already_subscribed'", async () => {
    seedStore("subscribers", [
      {
        id: "sub-1",
        email: "existing@example.com",
        source: "website",
        createdAt: Date.now(),
      },
    ]);

    const res = await POST(makeRequest({ email: "existing@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("already_subscribed");
  });

  it("invalid email (no @) returns 400", async () => {
    const res = await POST(makeRequest({ email: "notanemail" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("email");
  });

  it("missing email returns 400", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("empty string email returns 400", async () => {
    const res = await POST(makeRequest({ email: "" }));
    expect(res.status).toBe(400);
  });

  it("email is normalized to lowercase", async () => {
    const res = await POST(makeRequest({ email: "LOUD@EXAMPLE.COM" }));
    const data = await res.json();
    expect(data.status).toBe("subscribed");

    // Now the same email lowercase should be already_subscribed
    const res2 = await POST(makeRequest({ email: "loud@example.com" }));
    const data2 = await res2.json();
    expect(data2.status).toBe("already_subscribed");
  });

  it("custom source is accepted", async () => {
    const res = await POST(
      makeRequest({ email: "src@example.com", source: "landing_page" }),
    );
    const data = await res.json();
    expect(data.status).toBe("subscribed");
  });

  it("non-string email returns 400", async () => {
    const res = await POST(makeRequest({ email: 12345 }));
    expect(res.status).toBe(400);
  });

  it("non-JSON body returns error", async () => {
    const req = new Request("http://localhost:3000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json at all",
    });
    const res = await POST(req);
    // Implementation catches all errors; exact status depends on
    // whether json() throws before or after destructuring
    expect([400, 500]).toContain(res.status);
  });
});
