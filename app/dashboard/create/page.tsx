import { ResourceForm } from '@/components/resource-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateResourcePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Resource</CardTitle>
          <CardDescription>
            Share a new study resource with the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm />
        </CardContent>
      </Card>
    </div>
  )
}
