export type AgeGroup = "0-4" | "5-8";
export type CourseStatus = "draft" | "published";
export type LessonStatus = "draft" | "reviewed" | "published";
export type LessonType = "video" | "presentation" | "worksheet" | "quiz" | "mixed";
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type UserRole = "admin" | "parent" | "child_profile";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  age_group: AgeGroup;
  cover_image: string | null;
  status: CourseStatus;
  estimated_duration: number | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  series_slug?: string | null;
  series_order?: number | null;
  series_title?: string | null;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  deleted_at?: string | null;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  video_url: string | null;
  presentation_url: string | null;
  worksheet_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  status: LessonStatus;
  ai_generated: boolean;
  human_reviewed: boolean;
  reviewer_notes: string | null;
  created_at: string;
  deleted_at?: string | null;
}

export interface ChildProfile {
  id: string;
  parent_id: string;
  display_name: string;
  age_group: AgeGroup;
  grade: string | null;
  avatar_url: string | null;
  pin_hash: string | null;
  created_at: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  full_name: string;
  accepted_terms: boolean;
  parental_consent: boolean;
  created_at: string;
}

export interface Progress {
  id: string;
  child_profile_id: string;
  course_id: string;
  lesson_id: string;
  status: ProgressStatus;
  completed_at: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  order_index: number;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  feedback: string | null;
}

export interface QuizAttempt {
  id: string;
  child_profile_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

export interface CourseWithProgress extends Course {
  progress_count: number;
  total_lessons: number;
  completion_percentage: number;
}
