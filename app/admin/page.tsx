import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Redirect to articles management
  redirect('/admin/articles')
}
