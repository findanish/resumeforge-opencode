'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { JobStatus } from '@/types'
import { Trash2, FileText } from 'lucide-react'

const columns: { id: JobStatus; label: string; color: string }[] = [
  { id: 'wishlist', label: 'Wishlist', color: 'bg-muted' },
  { id: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-yellow-500' },
  { id: 'offer', label: 'Offer', color: 'bg-green-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
]

export default function TrackerPage() {
  const supabase = createClient()
  const { user, jobs, setJobs, resumes } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (!error && data) {
        setJobs(data)
      }
      setLoading(false)
    }

    fetchJobs()
  }, [user, supabase, setJobs])

  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    const updates: { status: JobStatus; applied_at?: string } = { status }

    if (status === 'applied' && !jobs.find((j) => j.id === jobId)?.applied_at) {
      updates.applied_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)

    if (!error) {
      setJobs(
        jobs.map((j) =>
          j.id === jobId ? { ...j, ...updates, updated_at: new Date().toISOString() } : j
        )
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (!error) {
      setJobs(jobs.filter((j) => j.id !== id))
    }
  }

  const getColumnJobs = (status: JobStatus) =>
    jobs.filter((j) => j.status === status)

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between border-b bg-card px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Application Tracker</h1>
          <p className="text-xs text-muted-foreground">
            Track your job applications through the hiring process
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-4">
          {columns.map((column) => {
            const columnJobs = getColumnJobs(column.id)
            return (
              <div
                key={column.id}
                className="flex w-72 flex-shrink-0 flex-col rounded-lg border bg-card"
              >
                <div className="flex items-center justify-between border-b p-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${column.color}`} />
                    <CardTitle className="text-sm">{column.label}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {columnJobs.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-2">
                    {columnJobs.map((job) => (
                      <Card key={job.id} className="group">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {job.title}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {job.company}
                              </p>
                            </div>
                            <Select
                              value={job.status}
                              onValueChange={(value) =>
                                handleStatusChange(job.id, value as JobStatus)
                              }
                            >
                              <SelectTrigger className="h-7 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {columns.map((col) => (
                                  <SelectItem key={col.id} value={col.id}>
                                    {col.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {job.applied_at && (
                            <p className="mt-2 text-2xs text-muted-foreground">
                              Applied: {formatDate(job.applied_at)}
                            </p>
                          )}
                          {job.resume_id && (
                            <div className="mt-2 flex items-center gap-1 text-2xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              Resume attached
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-end opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDelete(job.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {columnJobs.length === 0 && (
                    <div className="flex h-20 items-center justify-center">
                      <p className="text-xs text-muted-foreground">
                        No jobs in {column.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
