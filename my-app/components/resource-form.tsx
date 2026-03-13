'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  link: z.string().url({
    message: 'Please enter a valid URL.',
  }),
  category: z.string().optional(),
})

type ResourceFormProps = {
  initialData?: {
    id?: string
    title: string
    link: string
    category: string
    image_url: string | null
  }
}

export function ResourceForm({ initialData }: ResourceFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isEditing = !!initialData?.id

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      link: initialData?.link || '',
      category: initialData?.category || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    
    // Handle image upload from standard file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]
    let imageUrl = initialData?.image_url || null

    if (file) {
      const uniqueNum = new Date().getTime()
      const fName = `${uniqueNum}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '')}`
      const filePath = `images/${fName}`

      const { error: uploadError } = await supabase.storage
        .from('resource_images')
        .upload(filePath, file)

      if (uploadError) {
        setError('Error uploading image: ' + uploadError.message)
        setLoading(false)
        return
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('resource_images')
        .getPublicUrl(filePath)
      
      imageUrl = publicUrl
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('resources')
        .update({
          title: values.title,
          link: values.link,
          category: values.category,
          image_url: imageUrl,
        })
        .eq('id', initialData.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          title: values.title,
          link: values.link,
          category: values.category,
          image_url: imageUrl,
          user_id: user.id,
          user_email: user.email
        })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Next.js Documentation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link / URL *</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="E.g., AI, UI/UX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Image (Optional)</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  setPreviewUrl(url)
                } else {
                  setPreviewUrl(null)
                }
              }}
            />
          </FormControl>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a thumbnail or avatar for this resource.
          </p>
          {(previewUrl || initialData?.image_url) && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                {previewUrl ? 'Preview selected image:' : 'Current Image:'}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={previewUrl || initialData?.image_url || ''} 
                alt="Thumbnail preview" 
                className="h-32 w-32 object-cover rounded-md border shadow-sm" 
              />
            </div>
          )}
        </FormItem>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Resource' : 'Add Resource'}
        </Button>
      </form>
    </Form>
  )
}
