'use client'

import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function NavHeader() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-primary">
            StudyResources
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            {user && (
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden md:inline-block">
                {user.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
                Login
              </Link>
              <Link href="/register" className={buttonVariants({ variant: 'default' })}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
