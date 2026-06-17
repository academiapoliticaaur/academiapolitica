import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresă de email invalidă"),
  password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Adresă de email invalidă"),
  account_type: z.enum(["family", "invatator", "profesor"]),
  password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
  confirm_password: z.string(),
  accepted_terms: z.boolean().refine((v) => v === true, {
    message: "Trebuie să accepți termenii și condițiile",
  }),
  parental_consent: z.boolean().refine((v) => v === true, {
    message: "Consimțământul parental este obligatoriu",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Parolele nu coincid",
  path: ["confirm_password"],
});

export const childProfileSchema = z.object({
  display_name: z.string().min(2, "Prenumele trebuie să aibă cel puțin 2 caractere").max(50),
  age_group: z.enum(["0-4", "5-8"], { message: "Selectează grupa de vârstă" }),
  grade: z.string().optional(),
  pin: z.string().length(4, "PIN-ul trebuie să aibă exact 4 cifre").regex(/^\d+$/, "PIN-ul trebuie să conțină doar cifre").optional().or(z.literal("")),
});

export const courseSchema = z.object({
  title: z.string().min(3, "Titlul trebuie să aibă cel puțin 3 caractere"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug-ul poate conține doar litere mici, cifre și cratimă"),
  description: z.string().min(10, "Descrierea trebuie să aibă cel puțin 10 caractere"),
  age_group: z.enum(["0-4", "5-8"]),
  audience: z.enum(["children", "invatator", "profesor", "all"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
  estimated_duration: z.number().min(1).optional(),
  order_index: z.number().min(0).optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(3, "Titlul lecției trebuie să aibă cel puțin 3 caractere"),
  description: z.string().optional(),
  lesson_type: z.enum(["video", "presentation", "worksheet", "quiz", "mixed"]),
  video_url: z.string().url("URL YouTube invalid").optional().or(z.literal("")),
  presentation_url: z.string().optional().or(z.literal("")),
  worksheet_url: z.string().optional().or(z.literal("")),
  duration_minutes: z.number().min(1).optional(),
  order_index: z.number().min(0).optional(),
  status: z.enum(["draft", "reviewed", "published"]).optional(),
  ai_generated: z.boolean().optional(),
  human_reviewed: z.boolean().optional(),
  reviewer_notes: z.string().optional(),
  allow_download: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChildProfileFormData = z.infer<typeof childProfileSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type LessonFormData = z.infer<typeof lessonSchema>;
