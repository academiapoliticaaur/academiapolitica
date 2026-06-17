import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, childProfileSchema, courseSchema } from "@/lib/validation/schemas";

describe("loginSchema", () => {
  it("acceptă email și parolă valide", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "parola123" });
    expect(result.success).toBe(true);
  });

  it("respinge email invalid", () => {
    const result = loginSchema.safeParse({ email: "nu-e-email", password: "parola123" });
    expect(result.success).toBe(false);
  });

  it("respinge parola sub 8 caractere", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "abc" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/8 caractere/);
    }
  });
});

describe("registerSchema", () => {
  const validData = {
    full_name: "Ion Ionescu",
    email: "ion@example.com",
    account_type: "family" as const,
    password: "parola_sigura",
    confirm_password: "parola_sigura",
    accepted_terms: true,
    parental_consent: true,
  };

  it("acceptă date valide pentru cont family", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("respinge când parolele nu coincid", () => {
    const result = registerSchema.safeParse({ ...validData, confirm_password: "alta_parola" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("confirm_password"))).toBe(true);
    }
  });

  it("respinge dacă termenii nu sunt acceptați", () => {
    const result = registerSchema.safeParse({ ...validData, accepted_terms: false });
    expect(result.success).toBe(false);
  });

  it("acceptă tipuri de cont valide: invatator și profesor", () => {
    expect(registerSchema.safeParse({ ...validData, account_type: "invatator" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...validData, account_type: "profesor" }).success).toBe(true);
  });

  it("respinge tip de cont invalid", () => {
    const result = registerSchema.safeParse({ ...validData, account_type: "admin" });
    expect(result.success).toBe(false);
  });
});

describe("childProfileSchema", () => {
  it("acceptă profil valid fără PIN", () => {
    const result = childProfileSchema.safeParse({ display_name: "Andrei", age_group: "0-4" });
    expect(result.success).toBe(true);
  });

  it("acceptă profil cu PIN valid de 4 cifre", () => {
    const result = childProfileSchema.safeParse({ display_name: "Maria", age_group: "5-8", pin: "1234" });
    expect(result.success).toBe(true);
  });

  it("respinge PIN cu litere", () => {
    const result = childProfileSchema.safeParse({ display_name: "Maria", age_group: "5-8", pin: "12ab" });
    expect(result.success).toBe(false);
  });

  it("respinge PIN cu mai puțin de 4 cifre", () => {
    const result = childProfileSchema.safeParse({ display_name: "Maria", age_group: "5-8", pin: "123" });
    expect(result.success).toBe(false);
  });

  it("respinge grupă de vârstă invalidă", () => {
    const result = childProfileSchema.safeParse({ display_name: "Maria", age_group: "3-6" });
    expect(result.success).toBe(false);
  });
});

describe("courseSchema", () => {
  const validCourse = {
    title: "Curs de matematică",
    slug: "curs-de-matematica",
    description: "Descriere curs minim 10 caractere ok",
    age_group: "0-4" as const,
  };

  it("acceptă un curs valid", () => {
    const result = courseSchema.safeParse(validCourse);
    expect(result.success).toBe(true);
  });

  it("respinge titlu prea scurt (sub 3 caractere)", () => {
    const result = courseSchema.safeParse({ ...validCourse, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("respinge slug cu caractere invalide", () => {
    const result = courseSchema.safeParse({ ...validCourse, slug: "Slug Cu Majuscule" });
    expect(result.success).toBe(false);
  });

  it("acceptă slug cu litere mici, cifre și cratimă", () => {
    const result = courseSchema.safeParse({ ...validCourse, slug: "curs-123-valid" });
    expect(result.success).toBe(true);
  });

  it("respinge descriere prea scurtă (sub 10 caractere)", () => {
    const result = courseSchema.safeParse({ ...validCourse, description: "Scurt" });
    expect(result.success).toBe(false);
  });

  it("acceptă audience opțional", () => {
    const result = courseSchema.safeParse({ ...validCourse, audience: "invatator" });
    expect(result.success).toBe(true);
  });
});
