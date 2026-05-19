import { redirect } from 'next/navigation'

export default async function NewProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/areas/${id}?new-project=true`)
}
