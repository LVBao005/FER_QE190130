import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default async function Home() {
  const supabase = await createClient()

  // Fetch all resources with user email (using a subquery or join if setup, or just fetching all)
  // For simplicity since we didn't set up a distinct user profile table with public emails in this schema,
  // we'll fetch resources. You'd normally join auth.users but that's not accessible from public schema directly
  // without a view or trigger.
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Shared Study Resources
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover learning materials shared by other students for the FER202 exam.
        </p>
      </div>

      {!resources || resources.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground border rounded-lg bg-muted/50">
          No resources have been shared yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all">
               {resource.image_url ? (
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={resource.image_url} 
                    alt={resource.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                 <div className="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center p-6 text-center">
                    <span className="text-muted-foreground font-medium">{resource.title}</span>
                 </div>
              )}
              <CardHeader className="pt-4">
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
              <CardContent className="mt-auto">
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary uppercase font-bold">
                      {resource.user_email ? resource.user_email[0] : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {resource.user_email || 'Anonymous Student'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
