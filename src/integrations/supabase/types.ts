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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          coach: string
          created_at: string
          from_station: string
          id: string
          klass: string
          passengers: Json
          pnr: string
          quota: string
          status: string
          to_station: string
          total: number
          train_name: string
          train_no: string
          travel_date: string
          user_id: string
        }
        Insert: {
          coach: string
          created_at?: string
          from_station: string
          id?: string
          klass: string
          passengers?: Json
          pnr: string
          quota: string
          status?: string
          to_station: string
          total?: number
          train_name: string
          train_no: string
          travel_date: string
          user_id: string
        }
        Update: {
          coach?: string
          created_at?: string
          from_station?: string
          id?: string
          klass?: string
          passengers?: Json
          pnr?: string
          quota?: string
          status?: string
          to_station?: string
          total?: number
          train_name?: string
          train_no?: string
          travel_date?: string
          user_id?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          coach: string | null
          created_at: string
          id: string
          pnr: string | null
          seat: number | null
          station: string | null
          user_id: string
        }
        Insert: {
          coach?: string | null
          created_at?: string
          id?: string
          pnr?: string | null
          seat?: number | null
          station?: string | null
          user_id: string
        }
        Update: {
          coach?: string | null
          created_at?: string
          id?: string
          pnr?: string | null
          seat?: number | null
          station?: string | null
          user_id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          category: string
          coach: string | null
          created_at: string
          detail: string
          id: string
          seat: number | null
          station: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          coach?: string | null
          created_at?: string
          detail: string
          id?: string
          seat?: number | null
          station?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          coach?: string | null
          created_at?: string
          detail?: string
          id?: string
          seat?: number | null
          station?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          created_at: string
          eta: string | null
          eta_at: string
          id: string
          lines: Json
          placed_at: string
          stage: number
          stage_at: Json
          station: string
          total: number
          user_id: string
          vendor: string
        }
        Insert: {
          created_at?: string
          eta?: string | null
          eta_at?: string
          id?: string
          lines?: Json
          placed_at?: string
          stage?: number
          stage_at?: Json
          station: string
          total?: number
          user_id: string
          vendor: string
        }
        Update: {
          created_at?: string
          eta?: string | null
          eta_at?: string
          id?: string
          lines?: Json
          placed_at?: string
          stage?: number
          stage_at?: Json
          station?: string
          total?: number
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seat_requests: {
        Row: {
          coach: string
          created_at: string
          current_seat: string | null
          fare: number
          id: string
          reason: string | null
          seat: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach: string
          created_at?: string
          current_seat?: string | null
          fare?: number
          id?: string
          reason?: string | null
          seat: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach?: string
          created_at?: string
          current_seat?: string | null
          fare?: number
          id?: string
          reason?: string | null
          seat?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "passenger" | "tt"
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
      app_role: ["passenger", "tt"],
    },
  },
} as const
