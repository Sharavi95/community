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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          post_id: string | null
          status: Database["public"]["Enums"]["content_status"]
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          post_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          post_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
        }
        Relationships: [
          {
            foreignKeyName: "comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      community_roles: {
        Row: {
          community_id: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          community_id?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          community_id?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          left_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          community_id: string | null
          created_at: string
          id: string
          name: string | null
          type: Database["public"]["Enums"]["conversation_type"]
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
        }
        Update: {
          community_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "conversations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          community_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          community_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          community_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: string
          community_id: string
          created_at: string
          description: string
          id: string
          moderator_id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          community_id: string
          created_at?: string
          description: string
          id?: string
          moderator_id: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          community_id?: string
          created_at?: string
          description?: string
          id?: string
          moderator_id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          community_id: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          related_user_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          related_user_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          related_user_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          community_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Insert: {
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Update: {
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          comment_id: string | null
          community_id: string
          created_at: string
          id: string
          post_id: string | null
          reason: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          comment_id?: string | null
          community_id: string
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          comment_id?: string | null
          community_id?: string
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_with_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users_local"
            referencedColumns: ["id"]
          },
        ]
      }
      users_local: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          notification_settings: Json | null
          password: string
          role: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          notification_settings?: Json | null
          password: string
          role?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          notification_settings?: Json | null
          password?: string
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      communities_with_counts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          member_count: number | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          member_count?: never
          name?: string | null
        }
        Relationships: []
      }
      posts_with_meta: {
        Row: {
          author_username: string | null
          community_id: string | null
          community_name: string | null
          content: string | null
          created_at: string | null
          id: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_conversation_role: {
        Args: { _conversation_id: string; _role: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      search_users: {
        Args: { current_user_id?: string; query: string }
        Returns: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          notification_settings: Json | null
          password: string
          role: string | null
          username: string | null
        }[]
      }
    }
    Enums: {
      content_status: "active" | "flagged" | "deleted"
      conversation_type: "direct" | "group"
      notification_type:
        | "reply"
        | "mention"
        | "comment"
        | "moderation_alert"
        | "community_update"
        | "system"
      report_status: "pending" | "resolved" | "dismissed"
      report_type: "post" | "comment"
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
      content_status: ["active", "flagged", "deleted"],
      conversation_type: ["direct", "group"],
      notification_type: [
        "reply",
        "mention",
        "comment",
        "moderation_alert",
        "community_update",
        "system",
      ],
      report_status: ["pending", "resolved", "dismissed"],
      report_type: ["post", "comment"],
    },
  },
} as const
