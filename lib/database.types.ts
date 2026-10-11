export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      appointment_types: {
        Row: {
          code: string;
          discipline: Database["public"]["Enums"]["discipline"];
          duration_minutes: number;
          family_bookable: boolean;
          label: string;
          short_label: string;
        };
        Insert: {
          code: string;
          discipline: Database["public"]["Enums"]["discipline"];
          duration_minutes: number;
          family_bookable?: boolean;
          label: string;
          short_label: string;
        };
        Update: {
          code?: string;
          discipline?: Database["public"]["Enums"]["discipline"];
          duration_minutes?: number;
          family_bookable?: boolean;
          label?: string;
          short_label?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancelled_by_kind:
            Database["public"]["Enums"]["cancelled_by_kind"] | null;
          created_at: string;
          created_by: string | null;
          ends_at: string;
          id: string;
          notes: string | null;
          patient_id: string;
          provider_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          type: string;
          updated_at: string;
        };
        Insert: {
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancelled_by_kind?:
            Database["public"]["Enums"]["cancelled_by_kind"] | null;
          created_at?: string;
          created_by?: string | null;
          ends_at: string;
          id?: string;
          notes?: string | null;
          patient_id: string;
          provider_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          type: string;
          updated_at?: string;
        };
        Update: {
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancelled_by_kind?:
            Database["public"]["Enums"]["cancelled_by_kind"] | null;
          created_at?: string;
          created_by?: string | null;
          ends_at?: string;
          id?: string;
          notes?: string | null;
          patient_id?: string;
          provider_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey";
            columns: ["cancelled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_type_fkey";
            columns: ["type"];
            isOneToOne: false;
            referencedRelation: "appointment_types";
            referencedColumns: ["code"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          at: string;
          changed_fields: string[];
          id: string;
          record_id: string;
          table_name: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          at?: string;
          changed_fields?: string[];
          id?: string;
          record_id: string;
          table_name: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          at?: string;
          changed_fields?: string[];
          id?: string;
          record_id?: string;
          table_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      care_team: {
        Row: {
          patient_id: string;
          provider_id: string;
          role: string;
          schedule_summary: string | null;
        };
        Insert: {
          patient_id: string;
          provider_id: string;
          role: string;
          schedule_summary?: string | null;
        };
        Update: {
          patient_id?: string;
          provider_id?: string;
          role?: string;
          schedule_summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "care_team_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_team_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
        ];
      };
      centers: {
        Row: {
          address: string;
          city: string;
          id: string;
          name: string;
          phone: string;
          postal_code: string;
          state: string;
          timezone: string;
        };
        Insert: {
          address: string;
          city: string;
          id?: string;
          name: string;
          phone: string;
          postal_code: string;
          state: string;
          timezone: string;
        };
        Update: {
          address?: string;
          city?: string;
          id?: string;
          name?: string;
          phone?: string;
          postal_code?: string;
          state?: string;
          timezone?: string;
        };
        Relationships: [];
      };
      guardianships: {
        Row: {
          guardian_id: string;
          patient_id: string;
          relationship: string;
        };
        Insert: {
          guardian_id: string;
          patient_id: string;
          relationship: string;
        };
        Update: {
          guardian_id?: string;
          patient_id?: string;
          relationship?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guardianships_guardian_id_fkey";
            columns: ["guardian_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "guardianships_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          care_plan_note: string | null;
          created_at: string;
          date_of_birth: string;
          first_name: string;
          home_center_id: string;
          id: string;
          last_name: string;
          program: Database["public"]["Enums"]["program"];
          updated_at: string;
          weekly_aba_hours: number;
        };
        Insert: {
          care_plan_note?: string | null;
          created_at?: string;
          date_of_birth: string;
          first_name: string;
          home_center_id: string;
          id?: string;
          last_name: string;
          program: Database["public"]["Enums"]["program"];
          updated_at?: string;
          weekly_aba_hours: number;
        };
        Update: {
          care_plan_note?: string | null;
          created_at?: string;
          date_of_birth?: string;
          first_name?: string;
          home_center_id?: string;
          id?: string;
          last_name?: string;
          program?: Database["public"]["Enums"]["program"];
          updated_at?: string;
          weekly_aba_hours?: number;
        };
        Relationships: [
          {
            foreignKeyName: "patients_home_center_id_fkey";
            columns: ["home_center_id"];
            isOneToOne: false;
            referencedRelation: "centers";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      provider_hours: {
        Row: {
          ends_at: string;
          provider_id: string;
          starts_at: string;
          weekday: number;
        };
        Insert: {
          ends_at: string;
          provider_id: string;
          starts_at: string;
          weekday: number;
        };
        Update: {
          ends_at?: string;
          provider_id?: string;
          starts_at?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: "provider_hours_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
        ];
      };
      providers: {
        Row: {
          center_id: string;
          credential: string | null;
          discipline: Database["public"]["Enums"]["discipline"];
          display_name: string;
          id: string;
          profile_id: string | null;
        };
        Insert: {
          center_id: string;
          credential?: string | null;
          discipline: Database["public"]["Enums"]["discipline"];
          display_name: string;
          id?: string;
          profile_id?: string | null;
        };
        Update: {
          center_id?: string;
          credential?: string | null;
          discipline?: Database["public"]["Enums"]["discipline"];
          display_name?: string;
          id?: string;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "providers_center_id_fkey";
            columns: ["center_id"];
            isOneToOne: false;
            referencedRelation: "centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "providers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      my_patient_ids: { Args: never; Returns: string[] };
    };
    Enums: {
      appointment_status: "scheduled" | "completed" | "cancelled";
      cancelled_by_kind: "caregiver" | "center";
      discipline: "aba" | "speech" | "ot";
      program: "focused_aba" | "comprehensive_aba";
      user_role: "guardian" | "clinician";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: ["scheduled", "completed", "cancelled"],
      cancelled_by_kind: ["caregiver", "center"],
      discipline: ["aba", "speech", "ot"],
      program: ["focused_aba", "comprehensive_aba"],
      user_role: ["guardian", "clinician"],
    },
  },
} as const;
