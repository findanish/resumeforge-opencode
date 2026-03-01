import { create } from 'zustand'
import { Profile, Resume, Job, ParsedJobRequirements, ATSAnalysis } from '@/types'

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void

  profile: Profile | null
  profiles: Profile[]
  setProfiles: (profiles: Profile[]) => void
  setProfile: (profile: Profile | null) => void
  addProfile: (profile: Profile) => void
  updateProfile: (id: string, data: Partial<Profile>) => void

  resumes: Resume[]
  setResumes: (resumes: Resume[]) => void
  addResume: (resume: Resume) => void
  updateResume: (id: string, data: Partial<Resume>) => void

  jobs: Job[]
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  updateJob: (id: string, data: Partial<Job>) => void

  currentProfile: Profile | null
  setCurrentProfile: (profile: Profile | null) => void

  currentJob: ParsedJobRequirements | null
  setCurrentJob: (job: ParsedJobRequirements | null) => void

  currentResume: Resume | null
  setCurrentResume: (resume: Resume | null) => void

  atsAnalysis: ATSAnalysis | null
  setAtsAnalysis: (analysis: ATSAnalysis | null) => void

  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  profile: null,
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),
  setProfile: (profile) => set({ profile }),
  addProfile: (profile) => set((state) => ({ profiles: [profile, ...state.profiles] })),
  updateProfile: (id, data) =>
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...data } : p)),
      profile: state.profile?.id === id ? { ...state.profile, ...data } : state.profile,
    })),

  resumes: [],
  setResumes: (resumes) => set({ resumes }),
  addResume: (resume) => set((state) => ({ resumes: [resume, ...state.resumes] })),
  updateResume: (id, data) =>
    set((state) => ({
      resumes: state.resumes.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, data) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...data } : j)),
    })),

  currentProfile: null,
  setCurrentProfile: (profile) => set({ currentProfile: profile }),

  currentJob: null,
  setCurrentJob: (job) => set({ currentJob: job }),

  currentResume: null,
  setCurrentResume: (resume) => set({ currentResume: resume }),

  atsAnalysis: null,
  setAtsAnalysis: (analysis) => set({ atsAnalysis: analysis }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
