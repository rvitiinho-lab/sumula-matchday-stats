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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      match_events: {
        Row: {
          created_at: string
          id: string
          match_id: string
          minute: number
          player_id: string
          team: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          minute?: number
          player_id: string
          team: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          minute?: number
          player_id?: string
          team?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_players: {
        Row: {
          arrival_order: number | null
          assists: number | null
          fouls_committed: number
          fouls_suffered: number
          goals: number | null
          match_id: string
          player_id: string
          presence: string
          queue_index: number | null
          queue_position: number
          queue_status: string
          saves: number
          shots_on_goal: number
          tackles: number
          team: string | null
        }
        Insert: {
          arrival_order?: number | null
          assists?: number | null
          fouls_committed?: number
          fouls_suffered?: number
          goals?: number | null
          match_id: string
          player_id: string
          presence?: string
          queue_index?: number | null
          queue_position: number
          queue_status?: string
          saves?: number
          shots_on_goal?: number
          tackles?: number
          team?: string | null
        }
        Update: {
          arrival_order?: number | null
          assists?: number | null
          fouls_committed?: number
          fouls_suffered?: number
          goals?: number | null
          match_id?: string
          player_id?: string
          presence?: string
          queue_index?: number | null
          queue_position?: number
          queue_status?: string
          saves?: number
          shots_on_goal?: number
          tackles?: number
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_ratings: {
        Row: {
          match_id: string
          rated_id: string
          rater_id: string
          score: number
        }
        Insert: {
          match_id: string
          rated_id: string
          rater_id: string
          score: number
        }
        Update: {
          match_id?: string
          rated_id?: string
          rater_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_votes: {
        Row: {
          category: string
          match_id: string
          voted_id: string
          voter_id: string
        }
        Insert: {
          category: string
          match_id: string
          voted_id: string
          voter_id: string
        }
        Update: {
          category?: string
          match_id?: string
          voted_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_votes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_votes_voted_id_fkey"
            columns: ["voted_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          creator_id: string | null
          finished_at: string | null
          id: string
          location: string | null
          modality: string
          scheduled_at: string | null
          score_team_a: number | null
          score_team_b: number | null
          started_at: string | null
          status: string | null
          title: string | null
          voting_closed: boolean
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          finished_at?: string | null
          id?: string
          location?: string | null
          modality: string
          scheduled_at?: string | null
          score_team_a?: number | null
          score_team_b?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          voting_closed?: boolean
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          finished_at?: string | null
          id?: string
          location?: string | null
          modality?: string
          scheduled_at?: string | null
          score_team_a?: number | null
          score_team_b?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          voting_closed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "matches_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apelido: string
          created_at: string | null
          id: string
          nome: string
          overall_rating: number | null
          position: string
          quote: string | null
        }
        Insert: {
          apelido: string
          created_at?: string | null
          id: string
          nome: string
          overall_rating?: number | null
          position?: string
          quote?: string | null
        }
        Update: {
          apelido?: string
          created_at?: string | null
          id?: string
          nome?: string
          overall_rating?: number | null
          position?: string
          quote?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_voting: { Args: { _match: string }; Returns: undefined }
      fifo_size: { Args: { _modality: string }; Returns: number }
      is_match_creator: { Args: { _match: string }; Returns: boolean }
      is_match_player: {
        Args: { _match: string; _user: string }
        Returns: boolean
      }
      match_results: {
        Args: { _match: string }
        Returns: {
          avg_score: number
          bagre: number
          craque: number
          muralha: number
          player_id: string
          raters: number
        }[]
      }
      match_voting_open: { Args: { _match: string }; Returns: boolean }
      match_voting_progress: {
        Args: { _match: string }
        Returns: {
          eligible: number
          voters: number
        }[]
      }
      reflow_match_queue: { Args: { _match: string }; Returns: undefined }
      remove_match_player: {
        Args: { _match: string; _player: string }
        Returns: undefined
      }
      save_match_draw: {
        Args: { _match: string; _teams: Json }
        Returns: undefined
      }
      set_presence: {
        Args: { _match: string; _presence: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
