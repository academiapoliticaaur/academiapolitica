export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      parent_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          accepted_terms: boolean;
          parental_consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["parent_profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["parent_profiles"]["Insert"]>;
      };
      child_profiles: {
        Row: {
          id: string;
          parent_id: string;
          display_name: string;
          age_group: "0-4" | "5-8";
          grade: string | null;
          avatar_url: string | null;
          pin_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["child_profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["child_profiles"]["Insert"]>;
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          age_group: "0-4" | "5-8";
          cover_image: string | null;
          status: "draft" | "published";
          estimated_duration: number | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["courses"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["modules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          lesson_type: "video" | "presentation" | "worksheet" | "quiz" | "mixed";
          video_url: string | null;
          presentation_url: string | null;
          worksheet_url: string | null;
          duration_minutes: number | null;
          order_index: number;
          status: "draft" | "reviewed" | "published";
          ai_generated: boolean;
          human_reviewed: boolean;
          reviewer_notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      progress: {
        Row: {
          id: string;
          child_profile_id: string;
          course_id: string;
          lesson_id: string;
          status: "not_started" | "in_progress" | "completed";
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["progress"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["progress"]["Insert"]>;
      };
      quizzes: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quizzes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["quizzes"]["Insert"]>;
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          order_index: number;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_questions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Insert"]>;
      };
      quiz_answers: {
        Row: {
          id: string;
          question_id: string;
          answer_text: string;
          is_correct: boolean;
          feedback: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_answers"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["quiz_answers"]["Insert"]>;
      };
      quiz_attempts: {
        Row: {
          id: string;
          child_profile_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_attempts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["quiz_attempts"]["Insert"]>;
      };
    };
  };
}
