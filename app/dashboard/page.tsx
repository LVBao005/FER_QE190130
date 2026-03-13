import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { DashboardResourceActions } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null // Should be handled by middleware, but fallback
  }

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your study resources.</p>
        </div>
        <Link href="/dashboard/create" className={buttonVariants()}>
          Add Resource
        </Link>
      </div>

      {!resources || resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed bg-background">
          <h3 className="text-lg font-medium">No resources yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            You havent added any study resources.
          </p>
          <Link href="/dashboard/create" className={buttonVariants({ variant: 'outline' })}>
            Add your first resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all">
              {resource.image_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={resource.image_url} 
                    alt={resource.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className={!resource.image_url ? 'pt-6' : 'pt-4'}>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-lg">
                    <a href={resource.link} target="_blank" rel="noreferrer" className="hover:underline">
                      {resource.title}
                    </a>
                  </CardTitle>
                </div>
                {resource.category && (
                  <Badge variant="secondary" className="w-fit">{resource.category}</Badge>
                )}
              </CardHeader>
              <CardFooter className="mt-auto pt-4 flex gap-2">
                <Link 
                  href={`/dashboard/edit/${resource.id}`} 
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'flex-1' })}
                >
                  Edit
                </Link>
                <DashboardResourceActions id={resource.id} title={resource.title} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
