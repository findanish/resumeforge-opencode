'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'

export default function Home() {
  const { user } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/resumes')
    } else {
      router.push('/login')
    }
  }, [user, router])

  return null
}
