import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateResumeWithAI, calculateATSScore, generateLatexFromMarkdown } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { profileId, jobId, profileData, jobData, customContent } = await req.json()

    let profile = profileData
    let job = jobData

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!profile && profileId) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: profileRecord } = await supabase
        .from('profiles')
        .select('parsed_data')
        .eq('id', profileId)
        .maybeSingle()

      if (profileRecord?.parsed_data) {
        profile = profileRecord.parsed_data
      }
    }

    if (!job && jobId) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: jobRecord } = await supabase
        .from('jobs')
        .select('parsed_requirements')
        .eq('id', jobId)
        .maybeSingle()

      if (jobRecord?.parsed_requirements) {
        job = jobRecord.parsed_requirements
      }
    }

    if (!profile || !job) {
      return NextResponse.json(
        { error: 'Profile and job data are required' },
        { status: 400 }
      )
    }

    let content = customContent

    if (!content) {
      content = await generateResumeWithAI(profile, job)
    }

    const keywords = job.required_skills || []
    const atsAnalysis = await calculateATSScore(content, keywords)

    let latexCode = null
    try {
      latexCode = await generateLatexFromMarkdown(content, profile.name || 'Resume')
    } catch (latexError) {
      console.error('LaTeX generation error:', latexError)
    }

    return NextResponse.json({
      content,
      latex_code: latexCode,
      ats_analysis: atsAnalysis,
    })
  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
