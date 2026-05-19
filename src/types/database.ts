// Tipos del esquema de Supabase.
//
// Regenerar con:
//   npx supabase gen types typescript --project-id <PROJECT_REF> --schema public > src/types/database.ts
//
// Este archivo se mantiene a mano hasta que tengamos las credenciales para
// correr el comando anterior. Su forma replica la salida del generador
// (incluye Relationships, Views, Functions, CompositeTypes vacíos) para que
// el cliente de Supabase tipe las consultas correctamente.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          default_view: string
          dashboard_layout: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          default_view?: string
          dashboard_layout?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          default_view?: string
          dashboard_layout?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          area_id: string
          user_id: string
          name: string
          description: string | null
          status: ProjectStatus
          color: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          area_id: string
          user_id: string
          name: string
          description?: string | null
          status?: ProjectStatus
          color?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          area_id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: ProjectStatus
          color?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_area_id_fkey'
            columns: ['area_id']
            isOneToOne: false
            referencedRelation: 'areas'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          content: string | null
          status: TaskStatus
          priority: TaskPriority
          due_date: string | null
          sort_order: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          content?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: string | null
          sort_order?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          content?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: string | null
          sort_order?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          area_id: string | null
          project_id: string | null
          task_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          area_id?: string | null
          project_id?: string | null
          task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          area_id?: string | null
          project_id?: string | null
          task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notes_area_id_fkey'
            columns: ['area_id']
            isOneToOne: false
            referencedRelation: 'areas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notes_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notes_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'tasks'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      project_status: ProjectStatus
      task_status: TaskStatus
      task_priority: TaskPriority
    }
    CompositeTypes: Record<string, never>
  }
}

// Atajos de tipos para el resto del código.
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Area = Database['public']['Tables']['areas']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
