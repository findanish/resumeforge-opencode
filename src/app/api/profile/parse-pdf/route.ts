import { NextRequest, NextResponse } from 'next/server'
import { parseResumeWithAI } from '@/lib/groq'
import { PDFParser } from 'pdf2json'

export async function POST(req: NextRequest): Promise<NextResponse> {
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
    
    const text = await new Promise<string>((resolve, reject) => {
      // Workaround for type issues
      const pdfParser = new (PDFParser as any)(null, 1)
      
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData)
        reject(new Error('Failed to parse PDF'))
      })
      
      pdfParser.on('pdfParser_dataReady', () => {
        const text = pdfParser.getRawTextContent()
        resolve(text || '')
      })
      
      pdfParser.parseBuffer(buffer)
    })

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Try using a text file instead.' },
        { status: 400 }
      )
    }

    const parsed = await parseResumeWithAI(text)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please try a text file.' },
      { status: 500 }
    )
  }
}
