'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
          return
        }

        router.push('/resumes')
      } catch (err) {
        setError('An unexpected error occurred')
      }
    }

    handleCallback()
  }, [supabase, router])

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
