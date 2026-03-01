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
import { Upload, Loader2, Plus, Trash2, Save } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface Experience {
  id: string
  company: string
  title: string
  start_date: string
  end_date: string
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  grad_year: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const { user, profile, setProfile, profiles } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [summary, setSummary] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
        const parsed = data.parsed_data as any
        if (parsed) {
          setName(parsed.name || '')
          setEmail(parsed.email || '')
          setPhone(parsed.phone || '')
          setLocation(parsed.location || '')
          setSummary(parsed.summary || '')
          setSkills(parsed.skills || [])
          setExperience(parsed.experience || [])
          setEducation(parsed.education || [])
        }
      }
    }

    fetchProfile()
  }, [user, supabase, setProfile])

  const parseResume = async (text: string) => {
    const response = await fetch('/api/profile/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: text }),
    })

    if (!response.ok) throw new Error('Failed to parse resume')
    return response.json()
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    try {
      const text = await file.text()
      const parsed = await parseResume(text)

      setName(parsed.name || '')
      setEmail(parsed.email || '')
      setPhone(parsed.phone || '')
      setLocation(parsed.location || '')
      setSummary(parsed.summary || '')
      setSkills(parsed.skills || [])
      setExperience(parsed.experience || [])
      setEducation(parsed.education || [])

      toast({
        title: 'Resume parsed',
        description: 'Your profile has been updated from the resume',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse resume. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  })

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now().toString(),
        company: '',
        title: '',
        start_date: '',
        end_date: '',
        description: '',
      },
    ])
  }

  const handleUpdateExperience = (id: string, field: string, value: string) => {
    setExperience(
      experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    )
  }

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id))
  }

  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        grad_year: '',
      },
    ])
  }

  const handleUpdateEducation = (id: string, field: string, value: string) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    )
  }

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const parsedData = {
        name,
        email,
        phone,
        location,
        summary,
        skills,
        experience,
        education,
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            raw_resume_text: null,
            parsed_data: parsedData,
            is_default: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast({
        title: 'Profile saved',
        description: 'Your profile has been updated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile',
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
          <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
          <p className="text-xs text-muted-foreground">
            Build your profile once, apply to infinite jobs
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Profile
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <input {...getInputProps()} />
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Parsing your resume...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm">
                      {isDragActive
                        ? 'Drop your resume here'
                        : 'Drag & drop your resume here, or click to browse'}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      Supports .txt files (paste resume content directly for best results)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 0123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A brief summary of your professional background..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill..."
                />
                <Button variant="outline" onClick={handleAddSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Experience</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddExperience}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No experience added yet
                </p>
              ) : (
                experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="space-y-4 rounded-lg border p-4"
                  >
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'company', e.target.value)
                          }
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'title', e.target.value)
                          }
                          placeholder="Senior Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          value={exp.start_date}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'start_date', e.target.value)
                          }
                          placeholder="2020-01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          value={exp.end_date}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'end_date', e.target.value)
                          }
                          placeholder="present"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, 'description', e.target.value)
                        }
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Education</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddEducation}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No education added yet
                </p>
              ) : (
                education.map((edu) => (
                  <div key={edu.id} className="space-y-4 rounded-lg border p-4">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEducation(edu.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'institution', e.target.value)
                          }
                          placeholder="MIT"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'degree', e.target.value)
                          }
                          placeholder="Bachelor of Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Field</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'field', e.target.value)
                          }
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Graduation Year</Label>
                        <Input
                          value={edu.grad_year}
                          onChange={(e) =>
                            handleUpdateEducation(edu.id, 'grad_year', e.target.value)
                          }
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
