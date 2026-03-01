'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'

export default function ResumesPage() {
  const supabase = createClient()
  const { user, resumes, setResumes } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchResumes = async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setResumes(data)
      }
      setLoading(false)
    }

    fetchResumes()
  }, [user, supabase, setResumes])

  const filteredResumes = resumes.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    const { error } = await supabase.from('resumes').delete().eq('id', id)
    if (!error) {
      setResumes(resumes.filter((r) => r.id !== id))
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
          <h1 className="text-lg font-semibold tracking-tight">Resumes</h1>
          <p className="text-xs text-muted-foreground">
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/resumes/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </header>

      <div className="flex flex-shrink-0 items-center gap-2 border-b bg-card px-6 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resumes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredResumes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium">No resumes yet</h3>
              <p className="text-xs text-muted-foreground">
                Create your first resume to get started
              </p>
            </div>
            <Link href="/resumes/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResumes.map((resume) => (
              <Card key={resume.id} className="group">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="truncate text-sm font-medium">
                    {resume.name || resume.job_title || 'Untitled'}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/resumes/${resume.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(resume.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {resume.company_name && (
                      <span className="truncate">{resume.company_name}</span>
                    )}
                    {resume.company_name && resume.job_title && <span>•</span>}
                    {resume.job_title && (
                      <span className="truncate">{resume.job_title}</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      {resume.ats_score !== null && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-2xs font-medium">
                          ATS: {resume.ats_score}%
                        </span>
                      )}
                      {resume.job_match_score !== null && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-2xs font-medium">
                          Match: {resume.job_match_score}%
                        </span>
                      )}
                    </div>
                    <span className="text-2xs text-muted-foreground">
                      {formatDate(resume.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
