import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          raw_resume_text: string | null
          parsed_data: Record<string, unknown> | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raw_resume_text?: string | null
          parsed_data?: Record<string, unknown> | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          raw_resume_text?: string | null
          parsed_data?: Record<string, unknown> | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          profile_id: string | null
          job_url: string | null
          job_title: string | null
          company_name: string | null
          content: string | null
          latex_code: string | null
          ats_score: number | null
          job_match_score: number | null
          keywords_matched: string[] | null
          keywords_missing: string[] | null
          version: number
          name: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id?: string | null
          job_url?: string | null
          job_title?: string | null
          company_name?: string | null
          content?: string | null
          latex_code?: string | null
          ats_score?: number | null
          job_match_score?: number | null
          keywords_matched?: string[] | null
          keywords_missing?: string[] | null
          version?: number
          name?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string | null
          job_url?: string | null
          job_title?: string | null
          company_name?: string | null
          content?: string | null
          latex_code?: string | null
          ats_score?: number | null
          job_match_score?: number | null
          keywords_matched?: string[] | null
          keywords_missing?: string[] | null
          version?: number
          name?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          url: string | null
          title: string | null
          company: string | null
          raw_description: string | null
          parsed_requirements: Record<string, unknown> | null
          status: string
          applied_at: string | null
          resume_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url?: string | null
          title?: string | null
          company?: string | null
          raw_description?: string | null
          parsed_requirements?: Record<string, unknown> | null
          status?: string
          applied_at?: string | null
          resume_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string | null
          title?: string | null
          company?: string | null
          raw_description?: string | null
          parsed_requirements?: Record<string, unknown> | null
          status?: string
          applied_at?: string | null
          resume_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
