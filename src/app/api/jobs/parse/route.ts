import { NextRequest, NextResponse } from 'next/server'
import { parseJobWithAI } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { url, description } = await req.json()

    let jobDescription = description

    if (url && !description) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })
        const html = await response.text()

        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        const relevantSections = [
          'job description',
          'responsibilities',
          'requirements',
          'qualifications',
          'about the role',
          'what you will do',
          'what we look for',
        ]

        let bestSection = text
        for (const section of relevantSections) {
          const idx = text.toLowerCase().indexOf(section)
          if (idx !== -1) {
            bestSection = text.slice(idx, idx + 3000)
            break
          }
        }

        jobDescription = bestSection.slice(0, 4000)
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        return NextResponse.json(
          { error: 'Could not fetch job page. Please paste the description directly.' },
          { status: 400 }
        )
      }
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    const parsed = await parseJobWithAI(jobDescription)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Job parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse job description' },
      { status: 500 }
    )
  }
}
