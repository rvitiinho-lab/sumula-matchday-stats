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
          difficult_save: boolean
          id: string
          match_id: string
          minute: number
          player_id: string
          team: string
          type: string
        }
        Insert: {
          created_at?: string
          difficult_save?: boolean
          id?: string
          match_id: string
          minute?: number
          player_id: string
          team: string
          type: string
        }
        Update: {
          created_at?: string
          difficult_save?: boolean
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
          difficult_saves: number
          final_team: string | null
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
          victory_points: number
        }
        Insert: {
          arrival_order?: number | null
          assists?: number | null
          difficult_saves?: number
          final_team?: string | null
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
          victory_points?: number
        }
        Update: {
          arrival_order?: number | null
          assists?: number | null
          difficult_saves?: number
          final_team?: string | null
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
          victory_points?: number
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
      match_roles: {
        Row: {
          pelada_id: string
          role: string
          user_id: string
        }
        Insert: {
          pelada_id: string
          role?: string
          user_id: string
        }
        Update: {
          pelada_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_roles_pelada_id_fkey"
            columns: ["pelada_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_roles_user_id_fkey"
            columns: ["user_id"]
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
          arrival_counter: number
          clock_running_at: string | null
          clock_seconds: number
          created_at: string | null
          creator_id: string | null
          finished_at: string | null
          id: string
          location: string | null
          modality: string
          pelada_closed: boolean
          pelada_id: string | null
          round_number: number
          scheduled_at: string | null
          score_team_a: number | null
          score_team_b: number | null
          started_at: string | null
          status: string | null
          title: string | null
          voting_closed: boolean
        }
        Insert: {
          arrival_counter?: number
          clock_running_at?: string | null
          clock_seconds?: number
          created_at?: string | null
          creator_id?: string | null
          finished_at?: string | null
          id?: string
          location?: string | null
          modality: string
          pelada_closed?: boolean
          pelada_id?: string | null
          round_number?: number
          scheduled_at?: string | null
          score_team_a?: number | null
          score_team_b?: number | null
          started_at?: string | null
          status?: string | null
          title?: string | null
          voting_closed?: boolean
        }
        Update: {
          arrival_counter?: number
          clock_running_at?: string | null
          clock_seconds?: number
          created_at?: string | null
          creator_id?: string | null
          finished_at?: string | null
          id?: string
          location?: string | null
          modality?: string
          pelada_closed?: boolean
          pelada_id?: string | null
          round_number?: number
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
          {
            foreignKeyName: "matches_pelada_id_fkey"
            columns: ["pelada_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      pelada_messages: {
        Row: {
          message: string
          pelada_id: string
          player_id: string
        }
        Insert: {
          message: string
          pelada_id: string
          player_id: string
        }
        Update: {
          message?: string
          pelada_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pelada_messages_pelada_id_fkey"
            columns: ["pelada_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pelada_messages_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_follows: {
        Row: {
          follower_id: string
          player_id: string
        }
        Insert: {
          follower_id: string
          player_id: string
        }
        Update: {
          follower_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_follows_player_id_fkey"
            columns: ["player_id"]
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
      sports_teams: {
        Row: {
          crest_path: string | null
          id: string
          name: string
          owner_id: string
          seed: number
          tournament_id: string
        }
        Insert: {
          crest_path?: string | null
          id?: string
          name: string
          owner_id: string
          seed: number
          tournament_id: string
        }
        Update: {
          crest_path?: string | null
          id?: string
          name?: string
          owner_id?: string
          seed?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      team_follows: {
        Row: {
          follower_id: string
          team_id: string
        }
        Insert: {
          follower_id: string
          team_id: string
        }
        Update: {
          follower_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_follows_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_roster: {
        Row: {
          full_name: string
          id: string
          profile_id: string | null
          shirt_number: number
          team_id: string
        }
        Insert: {
          full_name: string
          id?: string
          profile_id?: string | null
          shirt_number: number
          team_id: string
        }
        Update: {
          full_name?: string
          id?: string
          profile_id?: string | null
          shirt_number?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_roster_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_roster_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_games: {
        Row: {
          away_id: string | null
          away_score: number | null
          home_id: string | null
          home_score: number | null
          id: string
          next_position: number | null
          next_round: number | null
          played: boolean
          position: number
          round: number
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          away_id?: string | null
          away_score?: number | null
          home_id?: string | null
          home_score?: number | null
          id?: string
          next_position?: number | null
          next_round?: number | null
          played?: boolean
          position: number
          round: number
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          away_id?: string | null
          away_score?: number | null
          home_id?: string | null
          home_score?: number | null
          id?: string
          next_position?: number | null
          next_round?: number | null
          played?: boolean
          position?: number
          round?: number
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_games_away_id_fkey"
            columns: ["away_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_games_home_id_fkey"
            columns: ["home_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_games_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "sports_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_goals: {
        Row: {
          game_id: string
          goals: number
          roster_id: string
        }
        Insert: {
          game_id: string
          goals: number
          roster_id: string
        }
        Update: {
          game_id?: string
          goals?: number
          roster_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_goals_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "tournament_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_goals_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "team_roster"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          format: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          format: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_match_mesario: {
        Args: { _match: string; _remove?: boolean; _user: string }
        Returns: undefined
      }
      can_operate_match: { Args: { _match: string }; Returns: boolean }
      can_write_award_message: {
        Args: { _pelada: string; _player: string }
        Returns: boolean
      }
      close_voting: { Args: { _match: string }; Returns: undefined }
      create_tournament: {
        Args: { _format: string; _games: Json; _name: string; _teams: Json }
        Returns: string
      }
      fifo_size: { Args: { _modality: string }; Returns: number }
      finish_pelada: { Args: { _match: string }; Returns: string }
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
      next_pelada_round: { Args: { _match: string }; Returns: string }
      operate_match_clock: {
        Args: { _action: string; _match: string }
        Returns: undefined
      }
      pelada_performances: {
        Args: { _match: string }
        Returns: {
          actions: number
          match_id: string
          mvps: number
          player_id: string
          points: number
        }[]
      }
      pelada_winner: { Args: { _match: string }; Returns: string }
      performance_points: {
        Args: {
          a: number
          c: number
          d: number
          fc: number
          fs: number
          g: number
          s: number
          t: number
          v: number
        }
        Returns: number
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
      save_tournament_result: {
        Args: {
          _away: number
          _game: string
          _goals: Json
          _home: number
          _winner?: string
        }
        Returns: undefined
      }
      save_tournament_score: {
        Args: { _away: number; _game: string; _home: number; _winner?: string }
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
