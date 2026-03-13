import { ResourceForm } from '@/components/resource-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch resource ensuring it belongs to current user
  const { data: resource } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single()

  if (!resource) {
    notFound()
  }

  // Double check authorization
  if (resource.user_id !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Resource</CardTitle>
          <CardDescription>
            Update details for &quot;{resource.title}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm 
            initialData={{
              id: resource.id,
              title: resource.title,
              link: resource.link,
              category: resource.category || '',
              image_url: resource.image_url,
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
