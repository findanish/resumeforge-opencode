import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseResumeWithAI } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json()

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      )
    }

    const parsed = await parseResumeWithAI(resumeText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Resume parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    )
  }
}
