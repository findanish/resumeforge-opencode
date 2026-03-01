export interface Profile {
  id: string
  user_id: string
  raw_resume_text: string | null
  parsed_data: ParsedProfileData | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ParsedProfileData {
  name: string
  email: string
  phone: string
  location: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
}

export interface Experience {
  company: string
  title: string
  start_date: string
  end_date: string
  description: string
}

export interface Education {
  institution: string
  degree: string
  field: string
  grad_year: string
}

export interface Resume {
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

export interface Job {
  id: string
  user_id: string
  url: string | null
  title: string | null
  company: string | null
  raw_description: string | null
  parsed_requirements: ParsedJobRequirements | null
  status: JobStatus
  applied_at: string | null
  resume_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type JobStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected'

export interface ParsedJobRequirements {
  title: string
  company: string
  required_skills: string[]
  preferred_skills: string[]
  experience_years: string | number
  education_requirement: string
  key_responsibilities: string[]
  keywords: string[]
}

export interface ATSAnalysis {
  ats_score: number
  format_score: number
  keyword_score: number
  completeness_score: number
  readability_score: number
  length_score: number
  keywords_matched: string[]
  keywords_missing: string[]
  suggestions: string[]
}
