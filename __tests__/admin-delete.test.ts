import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/lib/admin/guard", () => ({ requireAdmin: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/admin/course-duration", () => ({ recalculateCourseDuration: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: mockFrom }) }));

import { deleteLesson, deleteModule, deleteCourse } from "@/lib/actions/admin-delete";
import { requireAdmin } from "@/lib/admin/guard";
import { revalidatePath } from "next/cache";

type Resp = { data: unknown; error: { message: string } | null };

// Returnează un builder înlănțuit care se rezolvă la `resp` când e await-at
function chain(resp: Resp) {
  const b: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    in:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resp),
  };
  b.then = (res: (v: Resp) => unknown, rej?: (e: unknown) => unknown) =>
    Promise.resolve(resp).then(res, rej);
  return b;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
describe("deleteLesson", () => {
  it("șterge lecția cu succes și revalidează calea", async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: null }));

    const result = await deleteLesson("lesson-1", "course-1");

    expect(result).toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("lessons");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/courses/course-1");
  });

  it("returnează eroarea DB dacă ștergerea eșuează", async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: { message: "FK violation" } }));

    const result = await deleteLesson("lesson-1", "course-1");

    expect(result).toEqual({ error: "FK violation" });
  });

  it("returnează eroare dacă utilizatorul nu e admin", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("Acces interzis"));

    const result = await deleteLesson("lesson-1", "course-1");

    expect(result).toEqual({ error: "Acces interzis" });
  });
});

// ---------------------------------------------------------------------------
describe("deleteModule", () => {
  it("șterge modulul cu succes și revalidează calea", async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: null }));

    const result = await deleteModule("module-1", "course-1");

    expect(result).toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("modules");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/courses/course-1");
  });

  it("returnează eroarea DB dacă ștergerea eșuează", async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: { message: "Constraint error" } }));

    const result = await deleteModule("module-1", "course-1");

    expect(result).toEqual({ error: "Constraint error" });
  });
});

// ---------------------------------------------------------------------------
describe("deleteCourse", () => {
  it("soft-șterge cursul și modulele cu succes", async () => {
    // data: null => niciun modul => sare peste lessons update
    mockFrom.mockReturnValue(chain({ data: null, error: null }));

    const result = await deleteCourse("course-1");

    expect(result).toBeUndefined();
    expect(mockFrom).toHaveBeenCalledWith("modules");
    expect(mockFrom).toHaveBeenCalledWith("courses");
  });

  it("returnează eroarea DB dacă soft-delete cursului eșuează", async () => {
    mockFrom
      .mockReturnValueOnce(chain({ data: null, error: null })) // modules select (no modules)
      .mockReturnValueOnce(chain({ data: null, error: null })) // modules update deleted_at
      .mockReturnValueOnce(chain({ data: null, error: { message: "Nu se poate șterge" } })); // courses update

    const result = await deleteCourse("course-1");

    expect(result).toEqual({ error: "Nu se poate șterge" });
  });

  it("returnează eroare dacă utilizatorul nu e admin", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("Neautorizat"));

    const result = await deleteCourse("course-1");

    expect(result).toEqual({ error: "Neautorizat" });
  });
});
