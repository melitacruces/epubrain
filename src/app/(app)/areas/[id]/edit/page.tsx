import { redirect } from 'next/navigation'

export default async function EditAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/areas/${id}?edit=true`)
}
