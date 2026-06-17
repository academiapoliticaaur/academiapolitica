import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: mockFrom }) }));

import { POST } from "@/app/api/clasa/progress/route";

function makeReq(body: object): NextRequest {
  return new Request("http://localhost/api/clasa/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const VALID_BODY = {
  classCode: "ABC1",
  studentCode: "S001",
  lessonId: "lesson-1",
  courseId: "course-1",
};

function chain(data: unknown) {
  const resp = { data, error: null };
  const b: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resp),
  };
  b.then = (res: (v: typeof resp) => unknown, rej?: (e: unknown) => unknown) =>
    Promise.resolve(resp).then(res, rej);
  return b;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/clasa/progress", () => {
  it("returnează 400 dacă lipsesc câmpuri obligatorii", async () => {
    const res = await POST(makeReq({ classCode: "ABC1" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing fields");
  });

  it("returnează 404 dacă clasa nu există", async () => {
    mockFrom.mockReturnValue(chain(null));
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Class not found");
  });

  it("returnează 403 dacă cursul nu e asignat clasei", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1" }))   // class found
      .mockReturnValue(chain(null));                   // class_course absent
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Course not assigned to class");
  });

  it("returnează 400 dacă lecția nu aparține cursului", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1" }))
      .mockReturnValueOnce(chain({ course_id: "course-1" }))
      .mockReturnValueOnce(chain({ id: "lesson-1", modules: { course_id: "alt-course" } }));
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Lesson does not belong to course");
  });

  it("returnează 404 dacă elevul nu există", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1" }))
      .mockReturnValueOnce(chain({ course_id: "course-1" }))
      .mockReturnValueOnce(chain({ id: "lesson-1", modules: { course_id: "course-1" } }))
      .mockReturnValue(chain(null)); // student absent
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Student not found");
  });

  it("înregistrează progres lecție și returnează xp:10 (curs incomplet)", async () => {
    // 8 apeluri DB în ordine: class, class_course, lesson_check, student,
    // upsert_progress, modules, all_lessons, completed_progress
    mockFrom
      .mockReturnValueOnce(chain({ id: "cls-1" }))
      .mockReturnValueOnce(chain({ course_id: "course-1" }))
      .mockReturnValueOnce(chain({ id: "lesson-1", modules: { course_id: "course-1" } }))
      .mockReturnValueOnce(chain({ id: "stu-1", display_name: "Elev Test" }))
      .mockReturnValueOnce(chain(null)) // upsert progress
      .mockReturnValueOnce(chain([{ id: "mod-1" }])) // modules
      .mockReturnValueOnce(chain([
        { id: "lesson-1", title: "L1", module_id: "mod-1" },
        { id: "lesson-2", title: "L2", module_id: "mod-1" },
      ])) // all lessons (2 total — curs incomplet)
      .mockReturnValueOnce(chain([{ lesson_id: "lesson-1" }])); // completed

    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.xp).toBe(10);
    expect(json.courseComplete).toBe(false);
    expect(json.totalPoints).toBe(10);
  });
});
