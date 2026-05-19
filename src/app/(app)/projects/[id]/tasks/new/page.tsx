import { redirect } from 'next/navigation'

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/projects/${id}?new-task=true`)
}
