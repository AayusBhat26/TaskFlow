export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _MindMapToTag: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_MindMapToTag_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "MindMap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_MindMapToTag_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "Tag"
            referencedColumns: ["id"]
          },
        ]
      }
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      _TagToTask: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_TagToTask_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "Tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_TagToTask_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
        ]
      }
      Account: {
        Row: {
          access_token: string | null
          createdAt: string
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          provider_account_id: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          updatedAt: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          createdAt?: string
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          updatedAt: string
          userId: string
        }
        Update: {
          access_token?: string | null
          createdAt?: string
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      additionalResource: {
        Row: {
          id: string
          messageId: string | null
          name: string
          type: Database["public"]["Enums"]["AdditionalResourceTypes"]
          url: string
        }
        Insert: {
          id: string
          messageId?: string | null
          name: string
          type: Database["public"]["Enums"]["AdditionalResourceTypes"]
          url: string
        }
        Update: {
          id?: string
          messageId?: string | null
          name?: string
          type?: Database["public"]["Enums"]["AdditionalResourceTypes"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "additionalResource_messageId_fkey"
            columns: ["messageId"]
            isOneToOne: false
            referencedRelation: "Message"
            referencedColumns: ["id"]
          },
        ]
      }
      assignedToMindMap: {
        Row: {
          id: string
          mindMapId: string
          userId: string
        }
        Insert: {
          id: string
          mindMapId: string
          userId: string
        }
        Update: {
          id?: string
          mindMapId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignedToMindMap_mindMapId_fkey"
            columns: ["mindMapId"]
            isOneToOne: false
            referencedRelation: "MindMap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignedToMindMap_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      assignedToTask: {
        Row: {
          id: string
          taskId: string
          userId: string
        }
        Insert: {
          id: string
          taskId: string
          userId: string
        }
        Update: {
          id?: string
          taskId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignedToTask_taskId_fkey"
            columns: ["taskId"]
            isOneToOne: false
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignedToTask_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Conversation: {
        Row: {
          id: string
          workspaceId: string
        }
        Insert: {
          id: string
          workspaceId: string
        }
        Update: {
          id?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Conversation_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      Message: {
        Row: {
          content: string
          conversationId: string
          createdAt: string
          edited: boolean
          id: string
          senderId: string
          updatedAt: string | null
        }
        Insert: {
          content: string
          conversationId: string
          createdAt?: string
          edited?: boolean
          id: string
          senderId: string
          updatedAt?: string | null
        }
        Update: {
          content?: string
          conversationId?: string
          createdAt?: string
          edited?: boolean
          id?: string
          senderId?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Message_conversationId_fkey"
            columns: ["conversationId"]
            isOneToOne: false
            referencedRelation: "Conversation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_senderId_fkey"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      MindMap: {
        Row: {
          content: Json | null
          createdAt: string
          creatorId: string
          emoji: string
          id: string
          title: string
          updatedAt: string
          updatedUserId: string | null
          workspaceId: string
        }
        Insert: {
          content?: Json | null
          createdAt?: string
          creatorId: string
          emoji?: string
          id: string
          title: string
          updatedAt: string
          updatedUserId?: string | null
          workspaceId: string
        }
        Update: {
          content?: Json | null
          createdAt?: string
          creatorId?: string
          emoji?: string
          id?: string
          title?: string
          updatedAt?: string
          updatedUserId?: string | null
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "MindMap_creatorId_fkey"
            columns: ["creatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MindMap_updatedUserId_fkey"
            columns: ["updatedUserId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MindMap_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          clicked: boolean
          createdDate: string
          id: string
          mindMapId: string | null
          newUserRole: Database["public"]["Enums"]["UserPermission"] | null
          notifyCreatorId: string
          notifyType: Database["public"]["Enums"]["NotifyType"]
          seen: boolean
          taskId: string | null
          userId: string
          workspaceId: string
        }
        Insert: {
          clicked?: boolean
          createdDate?: string
          id: string
          mindMapId?: string | null
          newUserRole?: Database["public"]["Enums"]["UserPermission"] | null
          notifyCreatorId: string
          notifyType: Database["public"]["Enums"]["NotifyType"]
          seen?: boolean
          taskId?: string | null
          userId: string
          workspaceId: string
        }
        Update: {
          clicked?: boolean
          createdDate?: string
          id?: string
          mindMapId?: string | null
          newUserRole?: Database["public"]["Enums"]["UserPermission"] | null
          notifyCreatorId?: string
          notifyType?: Database["public"]["Enums"]["NotifyType"]
          seen?: boolean
          taskId?: string | null
          userId?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notification_notifyCreatorId_fkey"
            columns: ["notifyCreatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notification_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Notification_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      PomodoroSettings: {
        Row: {
          id: string
          longBreakDuration: number
          longBreakInterval: number
          rounds: number
          shortBreakDuration: number
          soundEffect: Database["public"]["Enums"]["PomodoroSoundEffect"]
          soundEffectVolume: number
          userId: string
          workDuration: number
        }
        Insert: {
          id: string
          longBreakDuration?: number
          longBreakInterval?: number
          rounds?: number
          shortBreakDuration?: number
          soundEffect?: Database["public"]["Enums"]["PomodoroSoundEffect"]
          soundEffectVolume?: number
          userId: string
          workDuration?: number
        }
        Update: {
          id?: string
          longBreakDuration?: number
          longBreakInterval?: number
          rounds?: number
          shortBreakDuration?: number
          soundEffect?: Database["public"]["Enums"]["PomodoroSoundEffect"]
          soundEffectVolume?: number
          userId?: string
          workDuration?: number
        }
        Relationships: [
          {
            foreignKeyName: "PomodoroSettings_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      savedMindMaps: {
        Row: {
          id: string
          mindMapId: string
          userId: string
        }
        Insert: {
          id: string
          mindMapId: string
          userId: string
        }
        Update: {
          id?: string
          mindMapId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "savedMindMaps_mindMapId_fkey"
            columns: ["mindMapId"]
            isOneToOne: false
            referencedRelation: "MindMap"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savedMindMaps_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      savedTask: {
        Row: {
          id: string
          taskId: string
          userId: string
        }
        Insert: {
          id: string
          taskId: string
          userId: string
        }
        Update: {
          id?: string
          taskId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "savedTask_taskId_fkey"
            columns: ["taskId"]
            isOneToOne: false
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savedTask_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Session: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Insert: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Subscription: {
        Row: {
          userId: string
          userRole: Database["public"]["Enums"]["UserPermission"]
          workspaceId: string
        }
        Insert: {
          userId: string
          userRole?: Database["public"]["Enums"]["UserPermission"]
          workspaceId: string
        }
        Update: {
          userId?: string
          userRole?: Database["public"]["Enums"]["UserPermission"]
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Subscription_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subscription_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      Tag: {
        Row: {
          color: Database["public"]["Enums"]["CustomColors"]
          id: string
          name: string
          workspaceId: string
        }
        Insert: {
          color: Database["public"]["Enums"]["CustomColors"]
          id: string
          name: string
          workspaceId: string
        }
        Update: {
          color?: Database["public"]["Enums"]["CustomColors"]
          id?: string
          name?: string
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Tag_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      Task: {
        Row: {
          content: Json | null
          createdAt: string
          creatorId: string
          dateId: string | null
          emoji: string
          id: string
          title: string
          updatedAt: string
          updatedUserId: string | null
          workspaceId: string
        }
        Insert: {
          content?: Json | null
          createdAt?: string
          creatorId: string
          dateId?: string | null
          emoji?: string
          id: string
          title: string
          updatedAt: string
          updatedUserId?: string | null
          workspaceId: string
        }
        Update: {
          content?: Json | null
          createdAt?: string
          creatorId?: string
          dateId?: string | null
          emoji?: string
          id?: string
          title?: string
          updatedAt?: string
          updatedUserId?: string | null
          workspaceId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Task_creatorId_fkey"
            columns: ["creatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Task_dateId_fkey"
            columns: ["dateId"]
            isOneToOne: false
            referencedRelation: "TaskDate"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Task_updatedUserId_fkey"
            columns: ["updatedUserId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Task_workspaceId_fkey"
            columns: ["workspaceId"]
            isOneToOne: false
            referencedRelation: "Workspace"
            referencedColumns: ["id"]
          },
        ]
      }
      TaskDate: {
        Row: {
          from: string | null
          id: string
          to: string | null
        }
        Insert: {
          from?: string | null
          id: string
          to?: string | null
        }
        Update: {
          from?: string | null
          id?: string
          to?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          completedOnboarding: boolean
          email: string | null
          emailVerified: string | null
          hashedPassword: string | null
          id: string
          image: string | null
          lastTimeActive: string
          name: string | null
          surname: string | null
          useCase: Database["public"]["Enums"]["UseCase"] | null
          username: string
        }
        Insert: {
          completedOnboarding?: boolean
          email?: string | null
          emailVerified?: string | null
          hashedPassword?: string | null
          id: string
          image?: string | null
          lastTimeActive?: string
          name?: string | null
          surname?: string | null
          useCase?: Database["public"]["Enums"]["UseCase"] | null
          username: string
        }
        Update: {
          completedOnboarding?: boolean
          email?: string | null
          emailVerified?: string | null
          hashedPassword?: string | null
          id?: string
          image?: string | null
          lastTimeActive?: string
          name?: string | null
          surname?: string | null
          useCase?: Database["public"]["Enums"]["UseCase"] | null
          username?: string
        }
        Relationships: []
      }
      VerificationToken: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
      Workspace: {
        Row: {
          adminCode: string
          canEditCode: string
          color: Database["public"]["Enums"]["CustomColors"]
          createdAt: string
          creatorId: string | null
          id: string
          image: string | null
          inviteCode: string
          name: string
          readOnlyCode: string
          updatedAt: string
        }
        Insert: {
          adminCode: string
          canEditCode: string
          color?: Database["public"]["Enums"]["CustomColors"]
          createdAt?: string
          creatorId?: string | null
          id: string
          image?: string | null
          inviteCode: string
          name: string
          readOnlyCode: string
          updatedAt: string
        }
        Update: {
          adminCode?: string
          canEditCode?: string
          color?: Database["public"]["Enums"]["CustomColors"]
          createdAt?: string
          creatorId?: string | null
          id?: string
          image?: string | null
          inviteCode?: string
          name?: string
          readOnlyCode?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Workspace_creatorId_fkey"
            columns: ["creatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AdditionalResourceTypes: "PDF" | "IMAGE"
      CustomColors:
        | "PURPLE"
        | "RED"
        | "GREEN"
        | "BLUE"
        | "PINK"
        | "YELLOW"
        | "ORANGE"
        | "CYAN"
        | "LIME"
        | "EMERALD"
        | "INDIGO"
        | "FUCHSIA"
      NotifyType:
        | "NEW_USER_IN_WORKSPACE"
        | "USER_LEFT_WORKSPACE"
        | "NEW_TASK"
        | "NEW_MIND_MAP"
        | "NEW_ROLE"
        | "NEW_ASSIGNMENT_TASK"
        | "NEW_ASSIGNMENT_MIND_MAP"
      PomodoroSoundEffect:
        | "ANALOG"
        | "BIRD"
        | "CHURCH_BELL"
        | "DIGITAL"
        | "FANCY"
        | "BELL"
      UseCase: "WORK" | "STUDY" | "PERSONAL_USE"
      UserPermission: "ADMIN" | "CAN_EDIT" | "READ_ONLY" | "OWNER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
