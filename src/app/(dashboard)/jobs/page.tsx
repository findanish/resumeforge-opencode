'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Search, Briefcase, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function JobsPage() {
  const supabase = createClient()
  const { user, jobs, setJobs } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [parsing, setParsing] = useState(false)

  const [jobUrl, setJobUrl] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [useUrl, setUseUrl] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setJobs(data)
      }
      setLoading(false)
    }

    fetchJobs()
  }, [user, supabase, setJobs])

  const filteredJobs = jobs.filter(
    (j) =>
      j.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleParseJob = async () => {
    if (!user) return

    const input = useUrl ? jobUrl : jobDescription
    if (!input.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a job URL or description',
        variant: 'destructive',
      })
      return
    }

    setParsing(true)
    try {
      const response = await fetch('/api/jobs/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: useUrl ? input : null,
          description: useUrl ? null : input,
        }),
      })

      if (!response.ok) throw new Error('Failed to parse job')

      const parsed = await response.json()

      const { data, error } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
          url: useUrl ? input : null,
          title: parsed.title,
          company: parsed.company,
          raw_description: useUrl ? null : input,
          parsed_requirements: parsed,
          status: 'wishlist',
        })
        .select()
        .single()

      if (error) throw error

      setJobs([data, ...jobs])
      setDialogOpen(false)
      setJobUrl('')
      setJobDescription('')

      toast({
        title: 'Job added',
        description: `Added ${parsed.title} at ${parsed.company}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse job. Try pasting the description directly.',
        variant: 'destructive',
      })
    } finally {
      setParsing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (!error) {
      setJobs(jobs.filter((j) => j.id !== id))
    }
  }

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
          <h1 className="text-lg font-semibold tracking-tight">Jobs</h1>
          <p className="text-xs text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} in your list
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Job</DialogTitle>
              <DialogDescription>
                Paste a job URL or description to parse the requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={useUrl ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseUrl(true)}
                >
                  URL
                </Button>
                <Button
                  variant={!useUrl ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseUrl(false)}
                >
                  Description
                </Button>
              </div>
              {useUrl ? (
                <div className="space-y-2">
                  <Label>Job URL</Label>
                  <Input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://jobs.example.com/job/123"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description..."
                    rows={8}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handleParseJob}
                disabled={parsing}
                className="w-full"
              >
                {parsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse Job'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-shrink-0 items-center gap-2 border-b bg-card px-6 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredJobs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium">No jobs yet</h3>
              <p className="text-xs text-muted-foreground">
                Add jobs to generate tailored resumes
              </p>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="group">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="truncate text-sm font-medium">
                    {job.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                  <div className="mt-3 flex items-center justify-between">
                    {job.parsed_requirements?.required_skills && (
                      <div className="flex flex-wrap gap-1">
                        {job.parsed_requirements.required_skills
                          .slice(0, 3)
                          .map((skill: string) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-2xs"
                            >
                              {skill}
                            </span>
                          ))}
                        {job.parsed_requirements.required_skills.length > 3 && (
                          <span className="text-2xs text-muted-foreground">
                            +{job.parsed_requirements.required_skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="text-2xs text-muted-foreground">
                      {formatDate(job.created_at)}
                    </span>
                  </div>
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Original
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
