'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Loader2, Sparkles, FileText, Code, Download } from 'lucide-react'
import { generateLatexFromMarkdown } from '@/lib/groq'

export default function NewResumePage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, profiles, jobs, setResumes, resumes } = useAppStore()

  const [step, setStep] = useState<'select' | 'generate' | 'edit'>('select')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [resumeName, setResumeName] = useState('')

  const [generatedContent, setGeneratedContent] = useState('')
  const [latexCode, setLatexCode] = useState('')
  const [atsScore, setAtsScore] = useState(0)
  const [jobMatchScore, setJobMatchScore] = useState(0)
  const [keywordsMatched, setKeywordsMatched] = useState<string[]>([])
  const [keywordsMissing, setKeywordsMissing] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)

      if (profilesData) {
        if (profilesData.length === 0) {
          toast({
            title: 'No profile found',
            description: 'Please create a profile first',
          })
          router.push('/profile')
        }
      }
    }

    fetchData()
  }, [user, supabase, router])

  const handleGenerate = async () => {
    if (!selectedProfileId || !selectedJobId) {
      toast({
        title: 'Error',
        description: 'Please select both a profile and a job',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/resumes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfileId,
          jobId: selectedJobId,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate resume')

      const data = await response.json()

      setGeneratedContent(data.content)
      setLatexCode(data.latex_code || '')
      setAtsScore(data.ats_analysis?.ats_score || 0)
      setJobMatchScore(data.ats_analysis?.keyword_score || 0)
      setKeywordsMatched(data.ats_analysis?.keywords_matched || [])
      setKeywordsMissing(data.ats_analysis?.keywords_missing || [])

      const selectedJob = jobs.find((j) => j.id === selectedJobId)
      setResumeName(
        `${selectedJob?.title || 'Resume'} at ${selectedJob?.company || 'Company'}`
      )

      setStep('generate')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate resume. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!user || !generatedContent) return

    setSaving(true)
    try {
      const selectedJob = jobs.find((j) => j.id === selectedJobId)

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          profile_id: selectedProfileId,
          job_id: selectedJobId,
          job_url: selectedJob?.url,
          job_title: selectedJob?.title,
          company_name: selectedJob?.company,
          content: generatedContent,
          latex_code: latexCode,
          ats_score: atsScore,
          job_match_score: jobMatchScore,
          keywords_matched: keywordsMatched,
          keywords_missing: keywordsMissing,
          name: resumeName,
          version: 1,
          is_published: true,
        })
        .select()
        .single()

      if (error) throw error

      setResumes([data, ...resumes])

      toast({
        title: 'Resume saved',
        description: 'Your resume has been saved',
      })

      router.push('/resumes')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save resume',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between border-b bg-card px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">New Resume</h1>
          <p className="text-xs text-muted-foreground">
            Generate an ATS-optimized resume tailored to a job
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {step === 'select' && (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select Profile</CardTitle>
                <CardDescription>
                  Choose which profile to use as the base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {(profile.parsed_data as any)?.name || 'Unnamed Profile'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select Job</CardTitle>
                <CardDescription>
                  Choose which job to tailor the resume for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title} at {job.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {jobs.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No jobs found. Add a job first.
                  </p>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={generating || !selectedProfileId || !selectedJobId}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Resume
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'generate' && (
          <div className="flex h-full gap-6">
            <div className="flex-1 overflow-auto">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                  <TabsTrigger value="latex">LaTeX</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-lg border bg-card p-8">
                    <pre className="whitespace-pre-wrap text-sm font-serif">
                      {generatedContent}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="markdown" className="mt-4">
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                  />
                </TabsContent>
                <TabsContent value="latex" className="mt-4">
                  <Textarea
                    value={latexCode}
                    onChange={(e) => setLatexCode(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="LaTeX code will appear here..."
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="w-80 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resume Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    placeholder="My Resume"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">ATS Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span>ATS Compatibility</span>
                      <span className="font-medium">{atsScore}%</span>
                    </div>
                    <Progress value={atsScore} className="mt-2 h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Job Match</span>
                      <span className="font-medium">{jobMatchScore}%</span>
                    </div>
                    <Progress value={jobMatchScore} className="mt-2 h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Keywords</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Matched</p>
                    <div className="flex flex-wrap gap-1">
                      {keywordsMatched.slice(0, 10).map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-2xs text-green-600"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Missing</p>
                    <div className="flex flex-wrap gap-1">
                      {keywordsMissing.slice(0, 10).map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-2xs text-red-600"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Save Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="w-full"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
