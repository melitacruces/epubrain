import { redirect } from 'next/navigation'

export default function NewAreaPage() {
  redirect('/areas?new=true')
}
