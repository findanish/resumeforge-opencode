'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { setUser } = useAppStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.parsed_data?.name || session.user.user_metadata?.full_name,
            avatar_url: profile?.parsed_data?.avatar_url || session.user.user_metadata?.avatar_url,
          })
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile?.parsed_data?.name || session.user.user_metadata?.full_name,
          avatar_url: profile?.parsed_data?.avatar_url || session.user.user_metadata?.avatar_url,
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
