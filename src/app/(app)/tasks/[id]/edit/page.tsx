import { redirect } from 'next/navigation'

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/tasks/${id}?edit=true`)
}
