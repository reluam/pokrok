import AdminLayout from '@/components/AdminLayout'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  return (
    <AdminLayout title="Dashboard" description="Vítejte v administračním panelu">
      <AdminDashboard />
    </AdminLayout>
  )
}
