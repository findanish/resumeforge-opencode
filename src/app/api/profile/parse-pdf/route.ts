import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI } from '@/lib/groq'
import { PDFParse } from 'pdf-parse'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const pdfParser = new PDFParse({ data: buffer })
    const data = await pdfParser.getText()
    const resumeText = data.text

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Try using a text file instead.' },
        { status: 400 }
      )
    }

    const parsed = await parseResumeWithAI(resumeText)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please try a text file or paste your resume content.' },
      { status: 500 }
    )
  }
}
