import { redirect } from 'next/navigation'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/projects/${id}?edit=true`)
}
