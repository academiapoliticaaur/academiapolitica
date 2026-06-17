import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";

function hashPin(pin: string): string {
  return createHash("sha256").update(`academia-aur-elev:${pin}`).digest("hex");
}

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: mockFrom }) }));

import { POST } from "@/app/api/grup/verify-pin/route";

function makeReq(body: object): NextRequest {
  return new Request("http://localhost/api/grup/verify-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function chain(data: unknown) {
  const resp = { data, error: null };
  const b: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resp),
  };
  b.then = (res: (v: typeof resp) => unknown, rej?: (e: unknown) => unknown) =>
    Promise.resolve(resp).then(res, rej);
  return b;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/grup/verify-pin", () => {
  it("returnează 400 la câmpuri lipsă", async () => {
    const res = await POST(makeReq({ classCode: "ABC1" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returnează 400 dacă PIN nu este format din 4 cifre", async () => {
    const res = await POST(makeReq({ classCode: "ABC1", studentCode: "S1", pin: "abc" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("PIN invalid");
  });

  it("returnează 400 dacă PIN are mai mult de 4 caractere", async () => {
    const res = await POST(makeReq({ classCode: "ABC1", studentCode: "S1", pin: "12345" }));
    expect(res.status).toBe(400);
  });

  it("returnează 404 dacă clasa nu există sau e inactivă", async () => {
    mockFrom.mockReturnValue(chain(null));
    const res = await POST(makeReq({ classCode: "NONE", studentCode: "S1", pin: "1234" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Clasa nu a fost găsită");
  });

  it("returnează 404 dacă elevul nu există în clasă", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1", status: "active" }))
      .mockReturnValueOnce(chain(null)); // student absent
    const res = await POST(makeReq({ classCode: "ABC1", studentCode: "NONE", pin: "1234" }));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Elevul nu a fost găsit");
  });

  it("returnează ok:true dacă elevul nu are PIN setat", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1", status: "active" }))
      .mockReturnValueOnce(chain({ id: "stu-1", student_pin: null }));
    const res = await POST(makeReq({ classCode: "ABC1", studentCode: "S1", pin: "1234" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("returnează ok:true pentru PIN corect", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1", status: "active" }))
      .mockReturnValueOnce(chain({ id: "stu-1", student_pin: hashPin("1234") }));
    const res = await POST(makeReq({ classCode: "ABC1", studentCode: "S1", pin: "1234" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("returnează 401 pentru PIN greșit", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1", status: "active" }))
      .mockReturnValueOnce(chain({ id: "stu-1", student_pin: hashPin("9999") }));
    const res = await POST(makeReq({ classCode: "ABC1", studentCode: "S1", pin: "1234" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/PIN incorect/);
  });
});
