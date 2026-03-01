import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export const groqClient = groq

export async function parseResumeWithAI(resumeText: string) {
  const prompt = `You are an expert resume parser. Extract structured data from this resume.
Return ONLY valid JSON with this exact schema. No markdown, no explanation:
{
  "name": "string",
  "email": "string", 
  "phone": "string",
  "location": "string",
  "summary": "string",
  "experience": [{"company": "string", "title": "string", "start_date": "string", "end_date": "string", "description": "string"}],
  "education": [{"institution": "string", "degree": "string", "field": "string", "grad_year": "string"}],
  "skills": ["string"]
}

Resume text:
${resumeText}`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-70b-versatile',
    temperature: 0.1,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Failed to parse resume')
  
  try {
    return JSON.parse(content)
  } catch {
    throw new Error('Failed to parse resume JSON')
  }
}

export async function parseJobWithAI(jobDescription: string) {
  const prompt = `Extract key information from this job description.
Return ONLY valid JSON with this exact schema. No markdown, no explanation:
{
  "title": "string",
  "company": "string", 
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "experience_years": "number or string",
  "education_requirement": "string",
  "key_responsibilities": ["string"],
  "keywords": ["string"]
}

Job description:
${jobDescription}`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-70b-versatile',
    temperature: 0.1,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Failed to parse job description')
  
  try {
    return JSON.parse(content)
  } catch {
    throw new Error('Failed to parse job JSON')
  }
}

export async function generateResumeWithAI(profile: Record<string, unknown>, job: Record<string, unknown>) {
  const prompt = `Given this profile and job description, generate an ATS-optimized resume.
Focus on:
1. Matching keywords from job description
2. Highlighting relevant experience
3. Using action verbs and metrics
4. Keeping it concise (1-2 pages)

IMPORTANT: Return ONLY raw markdown format. No explanations, no code blocks, no JSON.

Profile:
${JSON.stringify(profile, null, 2)}

Job Description:
${JSON.stringify(job, null, 2)}

Generate the resume in markdown format:`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-70b-versatile',
    temperature: 0.3,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Failed to generate resume')
  
  return content
}

export async function calculateATSScore(resumeContent: string, keywords: string[]) {
  const prompt = `Analyze this resume for ATS optimization.
Return ONLY valid JSON with this exact schema:
{
  "ats_score": number (0-100),
  "format_score": number (0-20),
  "keyword_score": number (0-30),
  "completeness_score": number (0-20),
  "readability_score": number (0-15),
  "length_score": number (0-15),
  "keywords_matched": ["string"],
  "keywords_missing": ["string"],
  "suggestions": ["string"]
}

Resume:
${resumeContent}

Required keywords:
${keywords.join(', ')}

Analyze and return JSON:`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-70b-versatile',
    temperature: 0.1,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Failed to calculate ATS score')
  
  try {
    return JSON.parse(content)
  } catch {
    throw new Error('Failed to parse ATS score')
  }
}

export async function generateLatexFromMarkdown(markdown: string, name: string) {
  const prompt = `Convert this markdown resume to LaTeX code.
Use a clean, professional resume template.
Return ONLY the LaTeX code, no explanations.

Resume content:
${markdown}

Generate LaTeX:`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-70b-versatile',
    temperature: 0.1,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Failed to generate LaTeX')
  
  return content
}
