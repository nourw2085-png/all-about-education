export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          last_message_at: string
          student_id: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          student_id: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          student_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_links: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_code: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_code: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_code?: string
          student_id?: string
        }
        Relationships: []
      }
      point_events: {
        Row: {
          assistant_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["point_kind"]
          note: string | null
          points: number
          ref_id: string | null
        }
        Insert: {
          assistant_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["point_kind"]
          note?: string | null
          points: number
          ref_id?: string | null
        }
        Update: {
          assistant_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["point_kind"]
          note?: string | null
          points?: number
          ref_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bank_number: string | null
          created_at: string
          email: string
          gender: Database["public"]["Enums"]["user_gender"]
          id: string
          linked_student_codes: string[]
          name: string
          papers: string[]
          points: number
          student_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bank_number?: string | null
          created_at?: string
          email: string
          gender: Database["public"]["Enums"]["user_gender"]
          id?: string
          linked_student_codes?: string[]
          name: string
          papers?: string[]
          points?: number
          student_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bank_number?: string | null
          created_at?: string
          email?: string
          gender?: Database["public"]["Enums"]["user_gender"]
          id?: string
          linked_student_codes?: string[]
          name?: string
          papers?: string[]
          points?: number
          student_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      assistant_scores: {
        Row: {
          answers: number | null
          assignments_graded: number | null
          assistant_id: string | null
          avatar_url: string | null
          name: string | null
          quizzes_graded: number | null
          total_points: number | null
          weekly_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assistant: { Args: { _uid: string }; Returns: boolean }
      is_conversation_member: {
        Args: { _conv: string; _uid: string }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _parent: string; _student: string }
        Returns: boolean
      }
      is_teacher: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "assistant" | "teacher" | "parent"
      message_status: "sent" | "delivered" | "read"
      point_kind:
        | "question_answered"
        | "assignment_graded"
        | "quiz_graded"
        | "quality_bonus"
      user_gender: "male" | "female"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "assistant", "teacher", "parent"],
      message_status: ["sent", "delivered", "read"],
      point_kind: [
        "question_answered",
        "assignment_graded",
        "quiz_graded",
        "quality_bonus",
      ],
      user_gender: ["male", "female"],
    },
  },
} as const
