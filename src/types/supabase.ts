export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          day_of_week: number;
          period: number;
          room: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          day_of_week: number;
          period: number;
          room: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          day_of_week?: number;
          period?: number;
          room?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          user_id: string;
          class_id: string | null;
          title: string;
          due_date: string;
          status: "pending" | "completed";
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          class_id?: string | null;
          title: string;
          due_date: string;
          status?: "pending" | "completed";
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          class_id?: string | null;
          title?: string;
          due_date?: string;
          status?: "pending" | "completed";
          memo?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          }
        ];
      };
      shifts: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          hourly_wage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          hourly_wage: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          hourly_wage?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          due_date: string | null;
          status: "pending" | "completed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          due_date?: string | null;
          status?: "pending" | "completed";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          due_date?: string | null;
          status?: "pending" | "completed";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
